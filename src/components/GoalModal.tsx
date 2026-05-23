import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth, useStudy } from '../lib/contexts';
import { Modal, Button } from './ui/Base';
import { Wand2 } from 'lucide-react';
import { Goal } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

const createFallbackStudyPlan = (startDate: string, endDate: string) => {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const plan: Array<{ date: string; title: string; duration: number }> = [];

  for (let current = new Date(start.getTime()); current <= end; current.setDate(current.getDate() + 1)) {
    plan.push({
      date: format(current, 'yyyy-MM-dd'),
      title: `Day ${plan.length + 1}`,
      duration: 30,
    });
  }

  return plan;
};

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { user } = useAuth();
  const { addTask, addGoal, updateGoal } = useStudy();
  const [loading, setLoading] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    generateTasks: true,
  });

  React.useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setNewGoal({
          title: goalToEdit.title,
          description: goalToEdit.description || '',
          startDate: goalToEdit.startDate,
          endDate: goalToEdit.endDate,
          generateTasks: false // Don't auto-generate tasks on edit
        });
      } else {
        setNewGoal({
          title: '',
          description: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          generateTasks: true,
        });
      }
    }
  }, [isOpen, goalToEdit]);

  const handleSaveGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, {
          title: newGoal.title,
          description: newGoal.description,
          startDate: newGoal.startDate,
          endDate: newGoal.endDate,
        });
        onClose();
        return;
      }

      let generatedPlan: Array<{ date: string; title: string; duration: number }> = [];

      if (newGoal.generateTasks) {
        try {
          const response = await fetch(`${import.meta.env.VITE_PORT}/api/ai/generate-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goal: newGoal.title,
              startDate: newGoal.startDate,
              endDate: newGoal.endDate,
            }),
          });

          if (!response.ok) {
            generatedPlan = createFallbackStudyPlan(newGoal.startDate, newGoal.endDate);
          } else {
            const plan = await response.json();
            if (!Array.isArray(plan) || plan.length === 0) {
              generatedPlan = createFallbackStudyPlan(newGoal.startDate, newGoal.endDate);
            } else {
              generatedPlan = plan;
            }
          }
        } catch (fetchError) {
          console.warn('AI generation failed or server unavailable, using fallback:', fetchError);
          generatedPlan = createFallbackStudyPlan(newGoal.startDate, newGoal.endDate);
        }
      }

      const goalId = await addGoal({
        userId: user.uid,
        title: newGoal.title,
        description: newGoal.description,
        startDate: newGoal.startDate,
        endDate: newGoal.endDate,
        status: 'active',
        progress: 0,
      });

      if (goalId && generatedPlan.length > 0) {
        for (const item of generatedPlan) {
          await addTask({
            userId: user.uid,
            goalId,
            title: item.title,
            category: 'AI Planned',
            priority: 'medium',
            duration: Number(item.duration) || 30,
            status: 'pending',
            date: item.date,
          }, { silent: true });
        }
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save goal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? "Edit Goal" : "Set Long-Term Goal"}>
      <form onSubmit={handleSaveGoal} className="space-y-4">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Goal Title</label>
          <input
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
            placeholder="e.g. Master React Advanced Patterns"
            value={newGoal.title}
            onChange={event => setNewGoal({ ...newGoal, title: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
          <textarea
            className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
            placeholder="What do you want to achieve?"
            value={newGoal.description}
            onChange={event => setNewGoal({ ...newGoal, description: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
            <input
              type="date"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
              value={newGoal.startDate}
              onChange={event => setNewGoal({ ...newGoal, startDate: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
            <input
              type="date"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
              value={newGoal.endDate}
              onChange={event => setNewGoal({ ...newGoal, endDate: event.target.value })}
            />
          </div>
        </div>
        
        {!goalToEdit && (
          <div className="flex items-center gap-3 rounded-xl border border-brand-indigo/20 bg-brand-indigo/5 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${newGoal.generateTasks ? 'bg-brand-indigo text-white' : 'bg-slate-200 text-slate-500'}`}>
              <Wand2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Auto-generate Tasks</p>
              <p className="text-[10px] text-slate-500">Gemini AI will create a daily study schedule for you.</p>
            </div>
            <input
              type="checkbox"
              checked={newGoal.generateTasks}
              onChange={event => setNewGoal({ ...newGoal, generateTasks: event.target.checked })}
              className="h-5 w-5 accent-brand-indigo"
            />
          </div>
        )}
        <Button variant="neubrutal" className="mt-4 w-full" disabled={loading}>
          {loading ? 'Saving...' : goalToEdit ? 'Save Changes' : 'Launch Goal'}
        </Button>
      </form>
    </Modal>
  );
};

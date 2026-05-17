import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  Filter,
  Wand2,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth, useStudy } from '../lib/contexts';
import { Button, Modal } from '../components/ui/Base';
import { TaskModal } from '../components/TaskModal';
import { format, addDays, isSameDay } from 'date-fns';
import { Task, Goal } from '../types';

export const Activity: React.FC<{ onGoalClick?: (id: string) => void }> = ({ onGoalClick }) => {
  const { user } = useAuth();
  const { tasks, goals, addTask, updateTask, deleteTask, addGoal, deleteGoal } = useStudy();

  const [activeTab, setActiveTab] = useState<'daily' | 'goals'>('daily');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    generateTasks: true
  });

  const [loading, setLoading] = useState(false);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const goalData = {
        userId: user.uid,
        title: newGoal.title,
        description: newGoal.description,
        startDate: newGoal.startDate,
        endDate: newGoal.endDate,
        status: 'active' as const,
        progress: 0,
      };

      const goalId = await addGoal(goalData);

      if (newGoal.generateTasks && goalId) {
        const res = await fetch('/api/ai/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: newGoal.title, startDate: newGoal.startDate, endDate: newGoal.endDate })
        });
        const plan = await res.json();

        // Add generated tasks linked to the goal
        for (const p of plan) {
          await addTask({
            userId: user.uid,
            goalId,
            title: p.title,
            category: 'AI Planned',
            priority: 'medium',
            duration: Number(p.duration) || 30,
            status: 'pending',
            date: p.date,
          });
        }
      }

      setNewGoal({ title: '', description: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'), generateTasks: true });
      setIsGoalModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const todayTasks = tasks
    .filter(t => isSameDay(new Date(t.date), new Date()))
    .sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });

  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(t => t.goalId === goalId);
    if (goalTasks.length === 0) return 0;
    const completedCount = goalTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedCount / goalTasks.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-auto overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Manage <span className="gradient-text">StudyPlanner</span></h2>
          <div className="flex gap-4 md:gap-6 mt-4 overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('daily')}
              className={`text-sm font-bold pb-2 transition-all relative ${activeTab === 'daily' ? 'text-indigo-500' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Daily Tasks
              {activeTab === 'daily' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`text-sm font-bold pb-2 transition-all relative ${activeTab === 'goals' ? 'text-purple-500' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Long-term Goals
              {activeTab === 'goals' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
            </button>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <Button variant="secondary" className="flex-1 md:flex-none justify-center gap-2 text-sm py-2 group">
            <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform" />
            <span>Filters</span>
          </Button>
          <Button
            variant="neubrutal"
            onClick={() => activeTab === 'daily' ? setIsTaskModalOpen(true) : setIsGoalModalOpen(true)}
            className="flex-1 md:flex-none justify-center gap-2 text-sm py-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'daily' ? (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {todayTasks.map((task) => (
              <div key={task.id} className={`glass-card p-6 border-l-4 group relative ${task.status === 'completed' ? 'border-l-indigo-500' : task.priority === 'high' ? 'border-l-red-500' : task.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-lg tracking-tight truncate transition-all ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{task.category || 'Focus Session'}</p>
                  </div>
                  <button
                    onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    className={`p-2.5 rounded-xl transition-all shadow-sm ${task.status === 'completed' ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-6 mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 opacity-70" />
                    <span>{task.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400 opacity-70" />
                    <span>{task.date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : task.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-[32px] border-dashed border border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No tasks for today. Stay focused.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {goals.map((goal) => {
              const progress = getGoalProgress(goal.id);
              return (
                <div
                  key={goal.id}
                  onClick={() => onGoalClick?.(goal.id)}
                  className="glass-card p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all group shadow-sm"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-50 to-purple-50 border border-slate-200 flex flex-col items-center justify-center text-indigo-500 shadow-inner group-hover:text-indigo-600 transition-colors">
                    <Target className="w-10 h-10 mb-1" />
                    <span className="text-xs font-bold">{progress}%</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">{goal.title}</h4>
                        <div className="flex gap-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${goal.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {goal.status}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-50" /> {goal.startDate}</span>
                            <span className="opacity-30">—</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-50" /> {goal.endDate}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                        className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-200 hover:border-red-100 shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{goal.description || 'Focus on your long-term evolution.'}</p>
                  </div>
                  <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Evolution Progress</p>
                      <span className="text-[10px] font-bold text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="py-24 text-center glass rounded-[40px] border-dashed border border-slate-200">
                <Target className="w-16 h-16 text-slate-400 mx-auto mb-6 opacity-30" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Establish your vision. Start mapping goals.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Set Long-Term Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Goal Title</label>
            <input
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-slate-900"
              placeholder="e.g. Master React Advanced Patterns"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Description</label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all min-h-[100px] text-slate-900"
              placeholder="What do you want to achieve?"
              value={newGoal.description}
              onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Start Date</label>
              <input
                type="date"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-slate-900"
                value={newGoal.startDate}
                onChange={e => setNewGoal({ ...newGoal, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">End Date</label>
              <input
                type="date"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-slate-900"
                value={newGoal.endDate}
                onChange={e => setNewGoal({ ...newGoal, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-brand-blue/5 rounded-xl border border-brand-blue/20">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newGoal.generateTasks ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'}`}>
              <Wand2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Auto-generate Tasks</p>
              <p className="text-[10px] text-slate-500">Gemini AI will create a daily study schedule for you.</p>
            </div>
            <input
              type="checkbox"
              checked={newGoal.generateTasks}
              onChange={e => setNewGoal({ ...newGoal, generateTasks: e.target.checked })}
              className="w-5 h-5 accent-brand-blue"
            />
          </div>
          <Button variant="neubrutal" className="w-full mt-4 bg-brand-blue shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] text-white" disabled={loading}>
            {loading ? 'Generating Schedule...' : 'Launch Goal'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

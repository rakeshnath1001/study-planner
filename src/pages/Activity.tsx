import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Plus,
  Target,
  Trash2,
  Wand2,
} from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth, useStudy } from '../lib/contexts';
import { Button, Modal } from '../components/ui/Base';
import { TaskModal } from '../components/TaskModal';

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export const Activity: React.FC<{ onGoalClick?: (id: string) => void }> = ({ onGoalClick }) => {
  const { user } = useAuth();
  const { tasks, goals, addTask, updateTask, deleteTask, addGoal, deleteGoal } = useStudy();

  const [activeTab, setActiveTab] = useState<'daily' | 'goals'>('daily');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    generateTasks: true,
  });

  const priorityFilters: PriorityFilter[] = ['all', 'high', 'medium', 'low'];
  const priorityLabel = priorityFilter === 'all' ? 'All' : priorityFilter;
  const cyclePriorityFilter = () => {
    const currentIndex = priorityFilters.indexOf(priorityFilter);
    setPriorityFilter(priorityFilters[(currentIndex + 1) % priorityFilters.length]);
  };

  const handleAddGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let generatedPlan: Array<{ date: string; title: string; duration: number }> = [];

      if (newGoal.generateTasks) {
        const response = await fetch('/api/ai/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: newGoal.title,
            startDate: newGoal.startDate,
            endDate: newGoal.endDate,
          }),
        });

        if (!response.ok) {
          throw new Error('Unable to generate study plan');
        }

        const plan = await response.json();
        if (!Array.isArray(plan)) {
          throw new Error('Generated study plan was not valid');
        }

        generatedPlan = plan;
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

      setNewGoal({
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        generateTasks: true,
      });
      setIsGoalModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to launch goal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const todayTasks = tasks
    .filter(task => isSameDay(new Date(task.date), new Date()))
    .filter(task => priorityFilter === 'all' || task.priority === priorityFilter)
    .sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });

  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(task => task.goalId === goalId);
    if (goalTasks.length === 0) return 0;
    const completedCount = goalTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedCount / goalTasks.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="w-full overflow-hidden md:w-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Manage <span className="gradient-text">StudyPlanner</span>
          </h2>
          <div className="mt-4 flex gap-4 overflow-x-auto whitespace-nowrap pb-1 md:gap-6">
            <button
              onClick={() => setActiveTab('daily')}
              className={`relative pb-2 text-sm font-bold transition-all ${activeTab === 'daily' ? 'text-indigo-500' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Daily Tasks
              {activeTab === 'daily' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`relative pb-2 text-sm font-bold transition-all ${activeTab === 'goals' ? 'text-purple-500' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Long-term Goals
              {activeTab === 'goals' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
            </button>
          </div>
        </div>

        <div className="flex w-full gap-4 md:w-auto">
          {activeTab === 'daily' && (
            <Button
              variant="secondary"
              onClick={cyclePriorityFilter}
              className="flex-1 justify-center gap-2 py-2 text-sm capitalize md:flex-none"
            >
              <Filter className="h-4 w-4" />
              <span>{priorityLabel}</span>
            </Button>
          )}
          <Button
            variant="neubrutal"
            onClick={() => activeTab === 'daily' ? setIsTaskModalOpen(true) : setIsGoalModalOpen(true)}
            className="flex-1 justify-center gap-2 py-2 text-sm md:flex-none"
          >
            <Plus className="h-5 w-5" />
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
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {todayTasks.map(task => (
              <div
                key={task.id}
                className={`glass-card group relative border-l-4 p-5 sm:p-6 ${task.status === 'completed' ? 'border-l-indigo-500' : task.priority === 'high' ? 'border-l-red-500' : task.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-lg font-bold tracking-tight transition-all ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{task.category || 'Focus Session'}</p>
                  </div>
                  <button
                    onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    className={`rounded-xl p-2.5 shadow-sm transition-all ${task.status === 'completed' ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                    aria-label={task.status === 'completed' ? 'Mark task pending' : 'Mark task complete'}
                  >
                    {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400 opacity-70" />
                    <span>{task.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400 opacity-70" />
                    <span>{task.date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : task.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="absolute right-2 top-2 rounded-lg bg-red-50 p-1.5 text-red-500 opacity-100 shadow-sm transition-all hover:scale-110 hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <div className="col-span-full rounded-[32px] border border-dashed border-slate-200 py-20 text-center glass">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400 opacity-50" />
                <p className="px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {priorityFilter === 'all' ? 'No tasks for today. Stay focused.' : `No ${priorityFilter} priority tasks today.`}
                </p>
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
            {goals.map(goal => {
              const progress = getGoalProgress(goal.id);

              return (
                <div
                  key={goal.id}
                  onClick={() => onGoalClick?.(goal.id)}
                  className="glass-card group flex cursor-pointer flex-col items-center gap-6 border border-slate-200 p-5 shadow-sm transition-all hover:border-indigo-300 sm:p-8 lg:flex-row lg:gap-10 lg:p-10"
                >
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-500 shadow-inner transition-colors group-hover:text-indigo-600 sm:h-24 sm:w-24">
                    <Target className="mb-1 h-10 w-10" />
                    <span className="text-xs font-bold">{progress}%</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="break-words text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-2xl">{goal.title}</h4>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                          <span className={`self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${goal.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {goal.status}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:gap-3">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 opacity-50" /> {goal.startDate}</span>
                            <span className="opacity-30">-</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 opacity-50" /> {goal.endDate}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                        className="self-start rounded-2xl border border-slate-200 bg-white p-3 text-slate-400 shadow-sm transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete goal"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{goal.description || 'Focus on your long-term evolution.'}</p>
                  </div>
                  <div className="w-full space-y-3 lg:w-64">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Evolution Progress</p>
                      <span className="text-[10px] font-bold text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="rounded-[32px] border border-dashed border-slate-200 px-4 py-20 text-center glass sm:rounded-[40px] sm:py-24">
                <Target className="mx-auto mb-6 h-16 w-16 text-slate-400 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Establish your vision. Start mapping goals.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Set Long-Term Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
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
          <Button variant="neubrutal" className="mt-4 w-full" disabled={loading}>
            {loading ? 'Generating Schedule...' : 'Launch Goal'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

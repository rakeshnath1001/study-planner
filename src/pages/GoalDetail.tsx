import React from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';

interface GoalDetailProps {
  goalId: string;
  onBack: () => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goalId, onBack }) => {
  const { goals, tasks, updateTask } = useStudy();

  const goal = goals.find(item => item.id === goalId);
  const goalTasks = tasks
    .filter(task => task.goalId === goalId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <AlertCircle className="mb-4 h-12 w-12 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest">Goal not found.</p>
        <Button variant="secondary" onClick={onBack} className="mt-6">Go Back</Button>
      </div>
    );
  }

  const completedTasks = goalTasks.filter(task => task.status === 'completed');
  const progress = goalTasks.length > 0 ? Math.round((completedTasks.length / goalTasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Goals</span>
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        <div className="space-y-6 xl:col-span-2">
          <div className="glass-card relative overflow-hidden border border-slate-200 bg-white/60 p-5 shadow-sm sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 -z-10 h-64 w-64 bg-indigo-500/5 blur-[100px]" />

            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] border border-slate-200 bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-500 shadow-sm sm:h-24 sm:w-24 sm:rounded-[32px]">
                <Target className="h-10 w-10" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{goal.title}</h1>
                <p className="leading-relaxed text-slate-600">{goal.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:mt-10 lg:gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Duration</p>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Calendar className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span className="text-sm">{goal.startDate} - {goal.endDate}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <div className={`h-2 w-2 rounded-full ${goal.status === 'active' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <span className="text-sm capitalize">{goal.status}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tasks</p>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-500" />
                  <span className="text-sm">{completedTasks.length} / {goalTasks.length} Done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card border border-slate-200 bg-white/60 p-5 shadow-sm sm:p-8 lg:p-10">
            <h2 className="mb-8 flex items-center gap-2 text-xl font-bold text-slate-900">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Evolution Timeline
            </h2>
            <div className="space-y-4">
              {goalTasks.length > 0 ? (
                goalTasks.map((task, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={task.id}
                    className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 sm:flex-row sm:items-center"
                  >
                    <button
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${task.status === 'completed' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white text-slate-300 shadow-inner hover:border-indigo-400 hover:text-indigo-400'}`}
                      aria-label={task.status === 'completed' ? 'Mark task pending' : 'Mark task complete'}
                    >
                      {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className={`break-words text-sm font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 sm:gap-4">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <Calendar className="h-3 w-3" /> {task.date}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <Clock className="h-3 w-3" /> {task.duration}m
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="py-10 text-center text-sm italic text-slate-500">No specific tasks linked to this goal yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:space-y-8">
          <div className="glass-card border border-slate-200 bg-white/60 p-6 shadow-sm sm:p-8 lg:p-10">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Current Evolution</h3>
            <div className="relative flex aspect-square w-full items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-slate-200" strokeWidth="8" />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="fill-none stroke-indigo-500"
                  strokeWidth="8"
                  strokeDasharray="282.6"
                  initial={{ strokeDashoffset: 282.6 }}
                  animate={{ strokeDashoffset: 282.6 - (282.6 * progress) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tight text-slate-900">{progress}%</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Complete</span>
              </div>
            </div>

            <div className="mt-8 space-y-4 lg:mt-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-500">Task Completion</span>
                <span className="font-bold text-emerald-500">{completedTasks.length}/{goalTasks.length}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-card border border-indigo-100 bg-indigo-50 p-6 shadow-sm sm:p-8">
            <h4 className="mb-2 text-sm font-bold text-indigo-900">Mentor Quick-Tip</h4>
            <p className="text-xs leading-relaxed text-indigo-700/80">
              Consistency is the architect of mastery. Completing even one sub-task today moves the evolution needle forward.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

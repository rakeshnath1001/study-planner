import React, { useState } from 'react';
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
  Edit2,
} from 'lucide-react';
import { useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';
import { TaskModal } from '../components/TaskModal';
import { GoalModal } from '../components/GoalModal';
import { Task, Goal } from '../types';

interface GoalDetailProps {
  goalId: string;
  onBack: () => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goalId, onBack }) => {
  const { goals, tasks, updateTask } = useStudy();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

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
                <div className="flex items-center justify-between gap-4">
                  <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{goal.title}</h1>
                  <button
                    onClick={() => {
                      setGoalToEdit(goal);
                      setIsGoalModalOpen(true);
                    }}
                    className="shrink-0 rounded-xl bg-blue-50 p-2 text-blue-500 shadow-sm transition-all hover:bg-blue-500 hover:text-white"
                    aria-label="Edit Goal"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
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
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="ml-auto rounded-lg bg-blue-50 p-2 text-blue-500 shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500 hover:text-white"
                      aria-label="Edit Task"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="py-10 text-center text-sm italic text-slate-500">No specific tasks linked to this goal yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:space-y-8">
          <div className="glass-card relative overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-6 shadow-xl shadow-slate-200/40 sm:p-8 lg:p-10">
            <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-indigo-500/5 blur-[80px]" />
            <div className="mb-10 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Current Evolution</h3>
              <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-indigo-500">LIVE</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-gradient-to-br from-indigo-950 via-slate-800 to-slate-900 bg-clip-text text-6xl font-black tracking-tighter text-transparent drop-shadow-sm sm:text-7xl"
                >
                  {progress}%
                </motion.span>
                <span className="rounded-full border border-slate-100 bg-white/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-md">
                  Complete
                </span>
              </div>
              
              <div className="relative w-full rounded-2xl border border-slate-200/60 bg-white/60 p-2 shadow-inner backdrop-blur-sm">
                <div className="relative h-8 w-full overflow-hidden rounded-xl bg-slate-100 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', bounce: 0.15 }}
                    className="relative h-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                    {/* Add subtle stripes for a premium technical feel */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] opacity-70" />
                  </motion.div>
                  
                  {/* Tick Marks overlay */}
                  <div className="absolute inset-0 flex justify-evenly pointer-events-none items-center">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className={`h-4 w-px rounded-full ${i < (progress / 10) - 1 ? 'bg-white/40' : 'bg-slate-300/50'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm lg:mt-12">
              <div className="mb-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold uppercase tracking-wider text-slate-500">Task Completion</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-emerald-500">{completedTasks.length}</span>
                  <span className="text-xs font-bold text-slate-400">/ {goalTasks.length}</span>
                </div>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                />
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

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        taskToEdit={taskToEdit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart2,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subDays } from 'date-fns';
import { useAuth, useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';

interface DashboardProps {
  onAddTask: () => void;
  onViewActivity: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddTask, onViewActivity }) => {
  const { profile } = useAuth();
  const { tasks, updateTask } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const todayTasks = tasks.filter(task => isSameDay(new Date(task.date), new Date()));
  const remainingToday = todayTasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!normalizedSearch) return true;

    return (
      task.title.toLowerCase().includes(normalizedSearch) ||
      (task.category || '').toLowerCase().includes(normalizedSearch)
    );
  });
  const completedToday = todayTasks.filter(task => task.status === 'completed');
  const completionRate = todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0;

  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const weeklyActivity = last7Days.map(day => {
    const minutes = tasks
      .filter(task => task.status === 'completed' && isSameDay(new Date(task.date), day))
      .reduce((total, task) => total + task.duration, 0);

    return {
      label: format(day, 'EEEEE'),
      minutes,
      isToday: isSameDay(day, new Date()),
    };
  });
  const maxWeeklyMinutes = Math.max(...weeklyActivity.map(day => day.minutes), 60);
  const monthDays = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {greeting}, <span className="gradient-text">{profile?.displayName || 'Student'}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">You have {remainingToday.length} tasks remaining for today.</p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto md:gap-4">
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2 text-sm text-slate-900 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 md:w-64"
            />
          </div>
          <Button variant="neubrutal" onClick={onAddTask} className="shrink-0 gap-2 py-2 text-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Create New Task</span>
            <span className="md:hidden">New</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            <div className="glass-card p-5 sm:p-6">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Study Progress</p>
                <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] text-green-600">{completedToday.length} done</span>
              </div>
              <p className="mb-3 text-2xl font-bold text-slate-900">{Math.round(completionRate)}%</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  className="h-full rounded-full bg-brand-indigo shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                />
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6">
              <p className="mb-2 text-sm font-medium text-slate-500">Daily Goal</p>
              <p className="text-2xl font-bold text-slate-900">
                {completedToday.length} / {todayTasks.length} <span className="text-sm font-normal text-slate-500">Tasks</span>
              </p>
              <div className="mt-3 flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-full rounded-full ${index < (completedToday.length / Math.max(todayTasks.length, 1)) * 5 ? 'bg-brand-indigo shadow-[0_0_8px_rgba(99,102,241,0.2)]' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6">
              <p className="mb-2 text-sm font-medium text-slate-500">Study Streak</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">
                  {profile?.streak || 0} <span className="text-sm font-normal text-slate-500">Days</span>
                </p>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-tighter text-slate-500">Keep it up!</p>
            </div>
          </div>

          <section className="glass-card flex min-h-[400px] flex-1 flex-col p-5 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">Today's Remaining Schedule</h2>
              <button onClick={onViewActivity} className="shrink-0 text-xs font-bold text-indigo-500 hover:underline">View All</button>
            </div>
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1 sm:pr-2">
              {remainingToday.length > 0 ? (
                remainingToday.map(task => (
                  <div key={task.id} className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm transition-all hover:border-indigo-300 sm:flex-row sm:items-center">
                    <button
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 shadow-inner transition-all ${task.status === 'completed' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                      aria-label={task.status === 'completed' ? 'Mark task pending' : 'Mark task complete'}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className={`truncate text-sm font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                      <p className="text-xs text-slate-500">{task.category || 'Focus Session'} - {task.duration} mins</p>
                    </div>
                    <span className={`self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight sm:self-auto ${task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                      {task.priority} Priority
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <BookOpen className="mb-4 h-12 w-12 opacity-20" />
                  <p className="italic">No tasks for today.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <div className="glass-card p-6 sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-900">
              <BarChart2 className="h-4 w-4 text-purple-500" />
              Weekly Activity
            </h3>
            <div className="flex h-32 items-end justify-between gap-2 px-2">
              {weeklyActivity.map((day, index) => (
                <div
                  key={`${day.label}-${index}`}
                  className={`w-full rounded-t-lg transition-all duration-500 ${day.isToday ? 'bg-brand-indigo shadow-lg shadow-indigo-500/20' : 'bg-brand-indigo/10 hover:bg-brand-indigo/30'}`}
                  style={{ height: `${day.minutes > 0 ? Math.max(8, (day.minutes / maxWeeklyMinutes) * 100) : 4}%` }}
                  title={`${day.minutes} completed minutes`}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between px-1 text-[10px] font-bold tracking-widest text-slate-400">
              {weeklyActivity.map((day, index) => (
                <span key={`${day.label}-label-${index}`} className={day.isToday ? 'text-brand-indigo' : undefined}>{day.label}</span>
              ))}
            </div>
          </div>

          <div className="glass-card flex flex-1 flex-col p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-slate-900">{format(new Date(), 'MMMM yyyy')}</span>
            </div>
            <div className="mb-4 grid grid-cols-7 px-2 text-center text-[10px] font-bold tracking-widest text-slate-400">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 px-1 text-center text-xs sm:gap-2">
              {monthDays.map(day => (
                <span
                  key={day.toISOString()}
                  className={`rounded-lg py-2 transition-all ${isSameDay(day, new Date()) ? 'border border-brand-indigo/30 bg-brand-indigo/10 font-bold text-brand-indigo' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  {format(day, 'd')}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <Button onClick={onAddTask} className="flex w-full items-center justify-center gap-2 py-4">
                <Plus className="h-5 w-5" />
                <span>Create New Task</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

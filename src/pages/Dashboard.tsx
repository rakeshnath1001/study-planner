import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
  Plus,
  Flame,
  ArrowUpRight,
  BookOpen,
  BarChart2
} from 'lucide-react';
import { useAuth, useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { format, isSameDay } from 'date-fns';

export const Dashboard: React.FC<{ onAddTask: () => void }> = ({ onAddTask }) => {
  const { profile } = useAuth();
  const { tasks, goals, updateTask } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');

  const todayTasks = tasks.filter(t => isSameDay(new Date(t.date), new Date()));
  const remainingToday = todayTasks.filter(t => 
    t.status !== 'completed' && 
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const completedToday = todayTasks.filter(t => t.status === 'completed');
  const completionRate = todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0;

  const data = [
    { name: 'Completed', value: completedToday.length },
    { name: 'Remaining', value: todayTasks.length - completedToday.length },
  ];
  if (todayTasks.length === 0) data[1].value = 1;

  const COLORS = ['#8b5cf6', 'rgba(0,0,0,0.05)'];

  const stats = [
    { label: 'Study Streak', value: `${profile?.streak || 0} Days`, icon: Flame, color: 'text-orange-500' },
    { label: 'Total Hours', value: profile?.totalStudyHours || 0, icon: Clock, color: 'text-blue-500' },
    { label: 'Completed', value: profile?.totalCompletedTasks || 0, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Current Score', value: profile?.productivityScore || 0, icon: TrendingUp, color: 'text-brand-purple' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Good morning, <span className="gradient-text">{profile?.displayName || 'Alex Rivera'} 👋</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">You have {remainingToday.length} tasks remaining for today.</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2 md:gap-4">
          <div className="relative flex-1 md:flex-none">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-white/60 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 backdrop-blur-sm transition-all" 
            />
          </div>
          <Button variant="neubrutal" onClick={onAddTask} className="gap-2 text-sm py-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Create New Task</span>
            <span className="md:hidden">New</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 glass-card rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-slate-500 font-medium">Study Progress</p>
                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full">+12%</span>
              </div>
              <p className="text-2xl font-bold mb-3 text-slate-900">{Math.round(completionRate)}%</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  className="bg-brand-indigo h-full rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                />
              </div>
            </div>

            <div className="p-6 glass-card">
              <p className="text-sm text-slate-500 font-medium mb-2">Daily Goal</p>
              <p className="text-2xl font-bold text-slate-900">{completedToday.length} / {todayTasks.length || 8} <span className="text-sm font-normal text-slate-500">Tasks</span></p>
              <div className="flex gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-full h-1.5 rounded-full ${i < (completedToday.length / Math.max(todayTasks.length, 1) * 5) ? 'bg-brand-indigo shadow-[0_0_8px_rgba(99,102,241,0.2)]' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>

            <div className="p-6 glass-card">
              <p className="text-sm text-slate-500 font-medium mb-2">Study Streak</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">{profile?.streak || 0} <span className="text-sm font-normal text-slate-500">Days</span></p>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-[10px] text-slate-500 mt-3 uppercase font-bold tracking-tighter">Keep it up! 🔥</p>
            </div>
          </div>

          {/* Schedule Section */}
          <section className="flex-1 min-h-[400px] flex flex-col p-8 glass-card">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Today's Remaining Schedule</h2>
              <button className="text-xs text-indigo-500 font-bold hover:underline">View All</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {remainingToday.length > 0 ? (
                remainingToday.map((task) => (
                  <div key={task.id} className="p-4 rounded-2xl bg-white/60 border border-slate-200 flex items-center gap-4 hover:border-indigo-300 transition-all group shadow-sm">
                    <div
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                      className={`w-6 h-6 rounded-md border-2 ${task.status === 'completed' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-white hover:border-indigo-400'} flex items-center justify-center cursor-pointer transition-all shadow-inner`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                      <p className="text-xs text-slate-500">{task.category || 'Focus Session'} • {task.duration} mins</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                      {task.priority} Priority
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
                  <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                  <p>No tasks for today. Feeling lucky?</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Productivity Widget */}
          <div className="p-8 glass-card">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              Weekly Activity
            </h3>
            <div className="flex items-end justify-between h-32 gap-2 px-2">
              {[40, 60, 85, 50, 30, 75, 20].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-lg transition-all duration-500 ${i === 2 ? 'bg-brand-indigo shadow-lg shadow-indigo-500/20' : 'bg-brand-indigo/10 hover:bg-brand-indigo/30'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 tracking-widest px-1">
              <span>M</span><span>T</span><span className="text-brand-indigo">W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>

          {/* Calendar Widget */}
          <div className="flex-1 p-8 glass-card flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-slate-900">{format(new Date(), 'MMMM yyyy')}</span>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-4 px-2 tracking-widest">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-2 px-1 text-center text-xs">
              {[...Array(30)].map((_, i) => (
                <span
                  key={i}
                  className={`py-2 rounded-lg transition-all ${i === format(new Date(), 'd') as any - 1 ? 'bg-brand-indigo/10 text-brand-indigo font-bold border border-brand-indigo/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  {i + 1}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <Button onClick={onAddTask} className="w-full flex items-center justify-center gap-2 py-4">
                <Plus className="w-5 h-5" />
                <span>Create New Task</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

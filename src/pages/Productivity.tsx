import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  Label
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Zap,
  Target
} from 'lucide-react';
import { useStudy } from '../lib/contexts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

export const Productivity: React.FC = () => {
  const { tasks } = useStudy();

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const dailyStats = last7Days.map(day => {
    const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
    const completed = dayTasks.filter(t => t.status === 'completed');
    return {
      name: format(day, 'EEE'),
      fullDate: format(day, 'MMM dd'),
      tasks: dayTasks.length,
      completed: completed.length,
      hours: completed.reduce((acc, t) => acc + (t.duration / 60), 0).toFixed(1),
    };
  });

  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  // Mock subject performance (calculated from categories)
  const categories = Array.from(new Set(tasks.map(t => t.category || 'General')));
  const subjectStats = categories.map(cat => {
    const catTasks = tasks.filter(t => (t.category || 'General') === cat);
    const completed = catTasks.filter(t => t.status === 'completed').length;
    return {
      name: cat,
      value: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Analytics <span className="gradient-text">Studio</span></h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Deep dive into your focus trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Weekly Focus', value: `${dailyStats.reduce((acc, d) => acc + Number(d.hours), 0).toFixed(1)}h`, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Completion Rate', value: `${Math.round(completionRate)}%`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Efficiency', value: 'High', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Goals Reached', value: '12', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={item.label}
            className="glass-card p-8 border border-slate-200 shadow-sm bg-white/60"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 shadow-sm border border-slate-100`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Productivity (Area Chart) */}
        <div className="lg:col-span-2 glass-card p-10 border border-slate-200 relative overflow-hidden group shadow-sm bg-white/60">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
               <TrendingUp className="w-5 h-5" />
               Study Hour Trends
             </h3>
             <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Focus Hours</span>
             </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Trends (Bar Chart) */}
        <div className="glass-card p-10 border border-slate-200 group shadow-sm bg-white/60">
          <h3 className="text-lg font-bold mb-10 flex items-center gap-2 text-slate-900 group-hover:text-emerald-600 transition-colors">
            <CheckCircle className="w-5 h-5" />
            Daily Task Load
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px' }}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Bar dataKey="tasks" fill="rgba(0,0,0,0.05)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} shadow="0 0 20px rgba(16,185,129,0.1)" />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-wise Performance */}
        <div className="lg:col-span-3 glass-card p-10 border border-slate-200 bg-white/60 hover:bg-white/80 transition-colors shadow-sm">
           <h3 className="text-lg font-bold mb-10 flex items-center gap-2 text-slate-900">
             <Target className="w-5 h-5 text-indigo-500" />
             Subject-wise Performance Score
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
              {subjectStats.map((item, i) => (
                <div key={item.name} className="space-y-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 truncate max-w-[120px]">{item.name}</p>
                      <p className="text-sm font-bold text-indigo-500">{item.value}%</p>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.2)]" 
                      />
                   </div>
                </div>
              ))}
              {subjectStats.length === 0 && (
                <p className="col-span-full text-center text-slate-500 font-medium italic py-8">Generate study data to unlock advanced performance metrics.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

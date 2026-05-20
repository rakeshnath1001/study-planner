import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import {
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudy } from '../lib/contexts';

interface DailyStat {
  name: string;
  fullDate: string;
  tasks: number;
  completed: number;
  hours: number;
}

interface SubjectStat {
  name: string;
  value: number;
}

interface SummaryCard {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

export function Productivity() {
  const { tasks, goals } = useStudy();
  const activeGoalIds = new Set(goals.map(goal => goal.id));
  const analyticsTasks = tasks.filter(task => !task.goalId || activeGoalIds.has(task.goalId));

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const dailyStats: DailyStat[] = last7Days.map(day => {
    const dayTasks = analyticsTasks.filter(t => isSameDay(new Date(t.date), day));
    const completed = dayTasks.filter(t => t.status === 'completed');
    const hours = completed.reduce((acc, t) => acc + t.duration / 60, 0);

    return {
      name: format(day, 'EEE'),
      fullDate: format(day, 'MMM dd'),
      tasks: dayTasks.length,
      completed: completed.length,
      hours: roundToTenth(hours),
    };
  });

  const totalCompleted = analyticsTasks.filter(t => t.status === 'completed').length;
  const totalTasks = analyticsTasks.length;
  const completionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
  const completedGoals = goals.filter(goal => {
    const goalTasks = analyticsTasks.filter(t => t.goalId === goal.id);
    const allLinkedTasksDone = goalTasks.length > 0 && goalTasks.every(t => t.status === 'completed');
    return goal.status === 'completed' || goal.progress >= 100 || allLinkedTasksDone;
  }).length;

  const categories: string[] = Array.from(new Set(analyticsTasks.map(t => t.category || 'General')));
  const subjectStats: SubjectStat[] = categories
    .map(cat => {
      const catTasks = analyticsTasks.filter(t => (t.category || 'General') === cat);
      const completed = catTasks.filter(t => t.status === 'completed').length;

      return {
        name: cat,
        value: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const weeklyFocusHours = dailyStats.reduce((acc, day) => acc + day.hours, 0).toFixed(1);
  const summaryCards: SummaryCard[] = [
    {
      label: 'Weekly Focus',
      value: `${weeklyFocusHours}h`,
      icon: Clock,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Completion Rate',
      value: `${Math.round(completionRate)}%`,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Efficiency',
      value: completionRate >= 70 ? 'High' : completionRate >= 40 ? 'Medium' : 'Low',
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Goals Reached',
      value: completedGoals.toString(),
      icon: Target,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 md:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Analytics <span className="gradient-text">Studio</span>
          </h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
            Deep dive into your focus trends
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4 2xl:gap-6">
        {summaryCards.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={item.label}
              className="glass-card min-w-0 border border-slate-200 bg-white/60 p-5 shadow-sm sm:p-6 xl:p-8"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 shadow-sm sm:mb-6 sm:h-12 sm:w-12 ${item.bg} ${item.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="break-words text-3xl font-bold tracking-tight text-slate-900">
                {item.value}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-[0.18em] text-slate-500 sm:tracking-[0.2em]">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-3 2xl:gap-8">
        <div className="glass-card group relative min-w-0 overflow-hidden border border-slate-200 bg-white/60 p-5 shadow-sm sm:p-8 2xl:col-span-2 2xl:p-10">
          <div className="absolute right-0 top-0 -z-10 h-64 w-64 bg-indigo-500/5 blur-[100px] transition-all duration-700 group-hover:bg-indigo-500/10" />
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
              <TrendingUp className="h-5 w-5" />
              Study Hour Trends
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Focus Hours
              </span>
            </div>
          </div>
          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fill="url(#colorHours)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card group min-w-0 border border-slate-200 bg-white/60 p-5 shadow-sm sm:p-8 2xl:p-10">
          <h3 className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-600 sm:mb-10">
            <CheckCircle className="h-5 w-5" />
            Daily Task Load
          </h3>
          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '16px',
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="tasks" fill="rgba(0,0,0,0.05)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card min-w-0 border border-slate-200 bg-white/60 p-5 shadow-sm transition-colors hover:bg-white/80 sm:p-8 2xl:col-span-3 2xl:p-10">
          <h3 className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900 sm:mb-10">
            <Target className="h-5 w-5 text-indigo-500" />
            Subject-wise Performance Score
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-10">
            {subjectStats.map((item, index) => (
              <div key={item.name} className="space-y-4">
                <div className="flex items-end justify-between">
                  <p className="max-w-[120px] truncate text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-indigo-500">{item.value}%</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.2, delay: index * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                  />
                </div>
              </div>
            ))}
            {subjectStats.length === 0 && (
              <p className="col-span-full py-8 text-center font-medium italic text-slate-500">
                Generate study data to unlock advanced performance metrics.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

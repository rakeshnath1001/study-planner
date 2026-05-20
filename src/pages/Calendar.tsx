import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Plus,
} from 'lucide-react';
import { useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';
import { TaskModal } from '../components/TaskModal';

export const Calendar: React.FC = () => {
  const { tasks } = useStudy();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });
  const monthTasks = tasks
    .filter(task => isSameMonth(new Date(task.date), currentMonth))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openTaskModal = (date: Date) => {
    setSelectedDate(date);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col space-y-6 md:space-y-8">
      <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200 bg-[#F6F3EB] pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
            {format(currentMonth, 'MMMM')} <span className="text-brand-purple">{format(currentMonth, 'yyyy')}</span>
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900" aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-brand-purple">Today</button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900" aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`rounded-lg border p-2 shadow-sm transition-all ${viewMode === 'grid' ? 'border-slate-200 bg-slate-100 text-brand-purple' : 'border-transparent text-slate-500 hover:text-slate-900'}`} aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`rounded-lg border p-2 shadow-sm transition-all ${viewMode === 'list' ? 'border-slate-200 bg-slate-100 text-brand-purple' : 'border-transparent text-slate-500 hover:text-slate-900'}`} aria-label="List view">
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="neubrutal" size="sm" className="flex-1 gap-2 sm:flex-none" onClick={() => openTaskModal(new Date())}>
            <Plus className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-h-[600px] min-w-[720px] grid-cols-7 overflow-hidden rounded-2xl border-l border-t border-slate-200 glass">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="border-b border-r border-slate-200 bg-white/50 p-3 text-center sm:p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{day}</span>
              </div>
            ))}

            {calendarDays.map((day, index) => {
              const dayTasks = tasks.filter(task => isSameDay(new Date(task.date), day));
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.005 }}
                  key={day.toISOString()}
                  className={`group relative min-h-[140px] border-b border-r border-slate-200 p-2 transition-all ${!isCurrentMonth ? 'bg-slate-100/50 opacity-40' : 'bg-white/20 hover:bg-white/60'}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${isToday ? 'scale-110 bg-brand-purple text-white shadow-sm' : 'text-slate-500 group-hover:text-slate-900'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {dayTasks.reduce((acc, task) => acc + (task.status === 'completed' ? task.duration : 0), 0)}m
                      </div>
                    )}
                  </div>

                  <div className="custom-scrollbar max-h-[100px] space-y-1 overflow-y-auto">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className={`truncate rounded border px-1.5 py-0.5 text-[9px] font-bold ${task.status === 'completed' ? 'border-green-200 bg-green-50 text-green-600' : 'border-slate-200 bg-white text-slate-600 shadow-sm group-hover:border-brand-purple/30 group-hover:text-slate-900'}`}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => openTaskModal(day)}
                    className="absolute bottom-2 right-2 rounded-full bg-brand-purple p-1 text-white opacity-100 transition-opacity hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Add task on ${format(day, 'MMM d')}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-h-[600px] flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white/50 p-4 glass sm:p-6">
          <div className="space-y-4">
            {monthTasks.map(task => (
              <div key={task.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">{task.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:gap-4">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3 opacity-70" />{task.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 opacity-70" />{task.duration}m</span>
                    <span>{task.category || 'General'}</span>
                  </div>
                </div>
                <span className={`self-start rounded-md px-2 py-1 text-[10px] font-bold uppercase sm:self-auto ${task.status === 'completed' ? 'border border-green-200 bg-green-50 text-green-600' : 'border border-brand-purple/20 bg-brand-purple/10 text-brand-purple'}`}>{task.status}</span>
              </div>
            ))}
            {monthTasks.length === 0 && (
              <div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-slate-500">No tasks scheduled for this month.</div>
            )}
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultDate={selectedDate}
      />
    </div>
  );
};

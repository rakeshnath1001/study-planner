import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock,
  LayoutGrid,
  List,
  Calendar as CalendarIcon
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
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center bg-[#F6F3EB] sticky top-0 z-20 pb-4 border-b border-slate-200 pt-4">
        <div>
          <h2 className="text-3xl font-display font-black italic tracking-tighter uppercase text-slate-900">
            {format(currentMonth, 'MMMM')} <span className="text-brand-purple">{format(currentMonth, 'yyyy')}</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentMonth(new Date())} className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-slate-500 hover:text-brand-purple">Today</button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex gap-3">
           <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg shadow-sm border transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-brand-purple border-slate-200' : 'text-slate-500 hover:text-slate-900 border-transparent'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg shadow-sm border transition-all ${viewMode === 'list' ? 'bg-slate-100 text-brand-purple border-slate-200' : 'text-slate-500 hover:text-slate-900 border-transparent'}`}><List className="w-4 h-4" /></button>
           </div>
           <Button variant="neubrutal" size="sm" className="gap-2" onClick={() => { setSelectedDate(new Date()); setIsTaskModalOpen(true); }}>
             <Plus className="w-4 h-4" />
             <span>Schedule</span>
           </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="flex-1 grid grid-cols-7 border-l border-t border-slate-200 rounded-2xl overflow-hidden glass neubrutalism min-h-[600px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 border-r border-b border-slate-200 bg-white/50 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">{day}</span>
            </div>
          ))}
        
        {calendarDays.map((day, i) => {
          const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.005 }}
              key={day.toString()}
              className={`min-h-[140px] p-2 border-r border-b border-slate-200 relative group transition-all ${!isCurrentMonth ? 'opacity-40 bg-slate-100/50' : 'hover:bg-white/60 bg-white/20'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isToday ? 'bg-brand-purple text-white neubrutalism-purple scale-110' : 'text-slate-500 group-hover:text-slate-900'}`}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                   <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     {dayTasks.reduce((acc, t) => acc + (t.status === 'completed' ? t.duration : 0), 0)}m
                   </div>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate border ${task.status === 'completed' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600 group-hover:border-brand-purple/30 group-hover:text-slate-900 shadow-sm'}`}
                  >
                    {task.title}
                  </div>
                ))}
              </div>

              <button onClick={() => { setSelectedDate(day); setIsTaskModalOpen(true); }} className="absolute bottom-2 right-2 p-1 bg-brand-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                <Plus className="w-3 h-3 text-white" />
              </button>
            </motion.div>
          );
        })}
        </div>
      ) : (
        <div className="flex-1 bg-white/50 border border-slate-200 rounded-2xl p-6 glass neubrutalism min-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {tasks.filter(t => isSameMonth(new Date(t.date), currentMonth)).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900">{task.title}</h3>
                  <div className="flex gap-4 text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 opacity-70" />{task.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 opacity-70" />{task.duration}m</span>
                    <span>{task.category}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${task.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20'}`}>{task.status}</span>
              </div>
            ))}
            {tasks.filter(t => isSameMonth(new Date(t.date), currentMonth)).length === 0 && (
               <div className="text-center py-20 text-slate-500 font-mono text-xs uppercase tracking-widest font-bold">No tasks scheduled for this month.</div>
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

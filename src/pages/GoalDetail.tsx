import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';
import { format } from 'date-fns';

interface GoalDetailProps {
  goalId: string;
  onBack: () => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goalId, onBack }) => {
  const { goals, tasks, updateTask } = useStudy();
  
  const goal = goals.find(g => g.id === goalId);
  const goalTasks = tasks.filter(t => t.goalId === goalId);
  
  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-bold uppercase tracking-widest text-xs">Goal not found.</p>
        <Button variant="secondary" onClick={onBack} className="mt-6">Go Back</Button>
      </div>
    );
  }

  const completedTasks = goalTasks.filter(t => t.status === 'completed');
  const progress = goalTasks.length > 0 
    ? Math.round((completedTasks.length / goalTasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Studio</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goal Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10 border border-slate-200 relative overflow-hidden bg-white/60 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-indigo-50 to-purple-50 border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                <Target className="w-10 h-10" />
              </div>
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{goal.title}</h1>
                <p className="text-slate-600 leading-relaxed">{goal.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{goal.startDate} - {goal.endDate}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <div className={`w-2 h-2 rounded-full ${goal.status === 'active' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <span className="text-sm capitalize">{goal.status}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tasks</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">{completedTasks.length} / {goalTasks.length} Done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 border border-slate-200 bg-white/60 shadow-sm">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Evolution Timeline
            </h2>
            <div className="space-y-4">
              {goalTasks.length > 0 ? (
                goalTasks.map((task, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={task.id} 
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 hover:border-indigo-300 transition-all group shadow-sm"
                  >
                    <button 
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white text-slate-300 hover:text-indigo-400 hover:border-indigo-400 shadow-inner'}`}
                    >
                      {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {task.date}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.duration}m
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-10 text-slate-500 italic text-sm">No specific tasks linked to this goal yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          <div className="glass-card p-10 border border-slate-200 bg-white/60 shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Current Evolution</h3>
             <div className="relative w-full aspect-square flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-slate-200 fill-none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-indigo-500 fill-none"
                    strokeWidth="8"
                    strokeDasharray="282.6"
                    initial={{ strokeDashoffset: 282.6 }}
                    animate={{ strokeDashoffset: 282.6 - (282.6 * progress) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tracking-tighter text-slate-900">{progress}%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Complete</span>
                </div>
             </div>
             
             <div className="mt-10 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Completion Velocity</span>
                  <span className="text-emerald-500 font-bold">+12%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                </div>
             </div>
          </div>

          <div className="glass-card p-8 bg-indigo-50 border border-indigo-100 shadow-sm">
             <h4 className="text-sm font-bold text-indigo-900 mb-2">Mentor Quick-Tip</h4>
             <p className="text-xs text-indigo-700/80 leading-relaxed">
               Consistency is the architect of mastery. completing even one sub-task today moves the evolution needle forward.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

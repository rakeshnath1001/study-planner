import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Target, BarChart2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/contexts';
import { Button } from '../components/ui/Base';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#F6F3EB] flex relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 p-6 sm:p-8 md:p-12">
        <div className="flex-1 space-y-10 max-w-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/60 border border-slate-200 rounded-full backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase">AI-Powered Planning</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 leading-[0.9]">
            Elevate your <br />
            <span className="gradient-text">StudyPlanner</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed">
            The intelligent productivity deck designed for modern students.
            Crystal clear organization, glassy aesthetics, and AI precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Button size="lg" className="px-10 gap-3 text-base shadow-2xl shadow-indigo-500/20" onClick={login}>
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex -space-x-3 items-center ml-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#F6F3EB] bg-slate-200 overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 100}`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="pl-6">
                <p className="text-xs font-bold text-slate-900 leading-none">12.5k+</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Students Active</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pt-8 sm:pt-12 border-t border-slate-200 mt-8 sm:mt-12 text-center sm:text-left">
            {[
              { label: 'Uptime', val: '99.9%' },
              { label: 'Tasks Done', val: '1.2M+' },
              { label: 'Rating', val: '4.9/5' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md lg:w-[480px] lg:max-w-none space-y-6 mt-12 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-[40px] p-10 space-y-8 relative"
          >
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Advanced Physics</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Prep Session</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { t: 'Review Maxwell Equations', c: true },
                { t: 'Quantum Tunneling Lab', c: false },
                { t: 'Prepare Discussion Paper', c: false },
              ].map((task, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${task.c ? 'bg-white/40 border-slate-200' : 'bg-white/80 border-slate-200 hover:border-indigo-300'}`}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.c ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white'}`}>
                    {task.c && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${task.c ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.t}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 pt-6">
              <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">72%</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Session Goal</p>
              </div>
              <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[72%] rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass bg-white/60 p-6 rounded-[28px] mt-6"
          >
            <div className="flex gap-5 items-center">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                <BarChart2 className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">Weekly Efficiency</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Last Update: Just Now</p>
              </div>
              <div className="ml-auto mt-2 sm:mt-0">
                <span className="text-2xl font-bold text-indigo-500">+14%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

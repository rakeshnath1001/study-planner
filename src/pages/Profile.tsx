import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Award,
  Flame,
  Clock,
  CheckCircle2,
  Trophy,
  Star,
  Shield,
  Zap,
  BookOpen,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useAuth, useStudy } from '../lib/contexts';
import { Button } from '../components/ui/Base';

export const Profile: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { tasks, goals } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: profile?.displayName || '',
    photoURL: profile?.photoURL || '',
  });

  const handleSave = async () => {
    await updateProfile(editData);
    setIsEditing(false);
  };

  const achievements = [
    { id: 1, title: 'Early Bird', desc: 'Complete 10 tasks before 10 AM', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', unlocked: true },
    { id: 2, title: 'Goal Crusher', desc: 'Achieve your first long-term goal', icon: Trophy, color: 'text-brand-purple', bg: 'bg-brand-purple/10', unlocked: goals.some(g => g.status === 'completed') },
    { id: 3, title: 'Consistency King', desc: 'Maintain a 7-day study streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', unlocked: (profile?.streak || 0) >= 7 },
    { id: 4, title: 'Ultra Learner', desc: 'Spend over 100 hours studying', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', unlocked: (profile?.totalStudyHours || 0) >= 100 },
    { id: 5, title: 'Master Planner', desc: 'Create 20 tasks using AI goals', icon: Shield, color: 'text-green-500', bg: 'bg-green-50', unlocked: tasks.length >= 20 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="relative glass neubrutalism rounded-3xl p-8 pt-20 overflow-hidden border border-slate-200">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink rounded-t-2xl opacity-10" />

        <div className="absolute top-16 left-0 w-full px-4 md:px-8 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-4 border-[#F6F3EB] overflow-hidden relative group shrink-0 shadow-sm">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <User className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-2">
                <input
                  type="text"
                  placeholder="URL"
                  value={editData.photoURL}
                  onChange={(e) => setEditData({ ...editData, photoURL: e.target.value })}
                  className="w-full text-[8px] bg-white border border-slate-200 rounded-md p-1 font-mono text-slate-900"
                />
              </div>
            )}
          </div>

          <div className="pb-0 md:pb-2 flex-1 min-w-[200px] w-full">
            {isEditing ? (
              <div className="space-y-2 max-w-sm mx-auto md:mx-0">
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  className="text-xl font-display font-black italic tracking-tighter w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-center md:text-left shadow-sm"
                  placeholder="Your Name"
                />
                <div className="flex justify-center md:justify-start gap-2">
                  <Button size="sm" onClick={handleSave} className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-0">
                <div>
                  <h2 className="text-2xl font-inter font-black tracking-tighter truncate max-w-sm text-slate-900">
                    {profile?.displayName || 'STUDENT'}
                  </h2>
                  <p className="text-slate-500 font-sans text-sm tracking-widest">{profile?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setEditData({ displayName: profile?.displayName || '', photoURL: profile?.photoURL || '' });
                    setIsEditing(true);
                  }}
                  className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-500 hover:text-indigo-500 rounded-2xl transition-all shadow-sm"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-40 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Score', value: profile?.productivityScore || 0, icon: Zap, color: 'text-brand-purple' },
            { label: 'Study Hours', value: profile?.totalStudyHours || 0, icon: Clock, color: 'text-blue-500' },
            { label: 'Completed', value: profile?.totalCompletedTasks || 0, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Streak', value: `${profile?.streak || 0} Days`, icon: Flame, color: 'text-orange-500' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center p-4 bg-white/60 rounded-2xl border border-slate-200 shadow-sm">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-display font-bold italic flex items-center gap-2 text-slate-900">
            <Award className="w-6 h-6 text-brand-purple" />
            ACHIEVEMENTS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((item) => (
              <div key={item.id} className={`glass p-5 rounded-2xl border border-slate-200 flex gap-4 items-center group transition-all ${!item.unlocked ? 'opacity-40 grayscale' : 'hover:neubrutalism hover:scale-[1.02] shadow-sm bg-white/80'}`}>
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-display font-bold italic flex items-center gap-2 text-slate-900">
            <TrendingUp className="w-6 h-6 text-brand-blue" />
            NEXT MILESTONES
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Study Master', sub: 'Reach 50 hours of total study', progress: 45, icon: BookOpen },
              { label: 'Consistency', sub: 'Maintain streak for 30 days', progress: 12, icon: Flame },
            ].map((milestone) => (
              <div key={milestone.label} className="glass p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm bg-white/80">
                <div className="flex items-center gap-3">
                  <milestone.icon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{milestone.label}</p>
                    <p className="text-[9px] text-slate-500">{milestone.sub}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-brand-blue font-bold">{milestone.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue" style={{ width: `${milestone.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit2,
  Flame,
  Save,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, useStudy } from '../lib/contexts';
import { Button, Modal } from '../components/ui/Base';

interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  unlocked: boolean;
}

interface Milestone {
  label: string;
  sub: string;
  progress: number;
  icon: LucideIcon;
}

export const Profile: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { tasks, goals, clearStudyData } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [editData, setEditData] = useState({
    displayName: profile?.displayName || '',
    photoURL: profile?.photoURL || '',
  });

  const completedCount = profile?.totalCompletedTasks || 0;
  const studyHours = profile?.totalStudyHours || 0;
  const streak = profile?.streak || 0;

  const handleSave = async () => {
    await updateProfile(editData);
    setIsEditing(false);
  };

  const handleClearStudyData = async () => {
    setIsResetting(true);
    try {
      await clearStudyData();
      setIsResetModalOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  const achievements: Achievement[] = [
    { id: 1, title: 'Task Starter', desc: 'Complete 10 study tasks', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', unlocked: completedCount >= 10 },
    { id: 2, title: 'Goal Crusher', desc: 'Achieve your first long-term goal', icon: Trophy, color: 'text-brand-purple', bg: 'bg-brand-purple/10', unlocked: goals.some(goal => goal.status === 'completed' || goal.progress >= 100) },
    { id: 3, title: 'Consistency King', desc: 'Maintain a 7-day study streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', unlocked: streak >= 7 },
    { id: 4, title: 'Ultra Learner', desc: 'Spend over 100 hours studying', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', unlocked: studyHours >= 100 },
    { id: 5, title: 'Master Planner', desc: 'Create 20 tasks using AI goals', icon: Shield, color: 'text-green-500', bg: 'bg-green-50', unlocked: tasks.length >= 20 },
  ];

  const milestones: Milestone[] = [
    {
      label: 'Study Master',
      sub: 'Reach 50 hours of total study',
      progress: Math.min(100, Math.round((studyHours / 50) * 100)),
      icon: BookOpen,
    },
    {
      label: 'Consistency',
      sub: 'Maintain streak for 30 days',
      progress: Math.min(100, Math.round((streak / 30) * 100)),
      icon: Flame,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 p-5 pt-20 glass sm:p-8 sm:pt-20">
        <div className="absolute left-0 top-0 h-32 w-full rounded-t-2xl bg-gradient-to-r from-brand-purple via-brand-indigo to-emerald-400 opacity-10" />

        <div className="absolute left-0 top-16 flex w-full flex-col items-center gap-4 px-4 text-center sm:px-8 md:flex-row md:items-end md:gap-6 md:text-left">
          <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-[#F6F3EB] bg-white shadow-sm md:h-32 md:w-32">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <User className="h-12 w-12 text-slate-400 md:h-16 md:w-16" />
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-2 backdrop-blur-sm">
                <input
                  type="url"
                  placeholder="Image URL"
                  value={editData.photoURL}
                  onChange={(event) => setEditData({ ...editData, photoURL: event.target.value })}
                  className="w-full rounded-md border border-slate-200 bg-white p-1 text-[8px] text-slate-900"
                />
              </div>
            )}
          </div>

          <div className="w-full min-w-0 flex-1 pb-0 md:pb-2">
            {isEditing ? (
              <div className="mx-auto max-w-sm space-y-2 md:mx-0">
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(event) => setEditData({ ...editData, displayName: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-xl font-black tracking-tight text-slate-900 shadow-sm md:text-left"
                  placeholder="Your Name"
                />
                <div className="flex justify-center gap-2 md:justify-start">
                  <Button size="sm" onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" /> Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)} className="gap-2">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                  <h2 className="max-w-sm truncate text-2xl font-black tracking-tight text-slate-900">
                    {profile?.displayName || 'Student'}
                  </h2>
                  <p className="truncate text-sm tracking-widest text-slate-500">{profile?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setEditData({ displayName: profile?.displayName || '', photoURL: profile?.photoURL || '' });
                    setIsEditing(true);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-500"
                  aria-label="Edit profile"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-44 grid grid-cols-2 gap-4 sm:mt-40 md:mt-32 md:grid-cols-4 md:gap-6">
          {[
            { label: 'Score', value: profile?.productivityScore || 0, icon: Zap, color: 'text-brand-purple' },
            { label: 'Study Hours', value: studyHours, icon: Clock, color: 'text-blue-500' },
            { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Streak', value: `${streak} Days`, icon: Flame, color: 'text-orange-500' },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-center shadow-sm">
                <Icon className={`mx-auto mb-2 h-5 w-5 ${stat.color}`} />
                <p className="break-words text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Award className="h-6 w-6 text-brand-purple" />
            Achievements
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {achievements.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.id} className={`flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition-all glass ${!item.unlocked ? 'opacity-40 grayscale' : 'bg-white/80 shadow-sm hover:scale-[1.02]'}`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-0.5 text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <TrendingUp className="h-6 w-6 text-brand-indigo" />
            Next Milestones
          </h3>
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;

              return (
                <div key={milestone.label} className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm glass">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{milestone.label}</p>
                      <p className="text-[9px] text-slate-500">{milestone.sub}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-brand-indigo">{milestone.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-brand-indigo" style={{ width: `${milestone.progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 shadow-sm glass sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-500 shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900">Reset Study Data</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Clear tasks, goals, and all study statistics.</p>
            </div>
          </div>
          <Button variant="danger" onClick={() => setIsResetModalOpen(true)} className="w-full gap-2 sm:w-auto">
            <Trash2 className="h-4 w-4" />
            Clear Data
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          if (!isResetting) setIsResetModalOpen(false);
        }}
        title="Clear Study Data"
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-slate-700">
            This permanently deletes your tasks and goals, then resets productivity score, study hours, completed tasks, and streak to zero.
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsResetModalOpen(false)}
              disabled={isResetting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleClearStudyData}
              disabled={isResetting}
              className="w-full gap-2 sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {isResetting ? 'Clearing...' : 'Clear Everything'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

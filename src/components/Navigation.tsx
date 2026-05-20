import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Activity,
  BarChart2,
  Calendar,
  User,
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../lib/contexts';

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const { logout, profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'productivity', icon: BarChart2, label: 'Productivity' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen border-r border-slate-200 flex flex-col p-6 bg-[#F6F3EB] md:bg-white/60 backdrop-blur-2xl transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">StudyPlanner</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (currentPage === 'goal-detail' && item.id === 'activity');

            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setIsOpen(false);
                }}
                className={`w-full group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative text-sm ${isActive
                  ? 'bg-white shadow-sm text-brand-indigo font-semibold border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'
                  }`}
              >
                <Icon className={`w-5 h-5 opacity-70 transition-transform ${isActive ? 'opacity-100' : 'group-hover:scale-110'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-200 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-indigo-200 overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-800">{profile?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Student</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; currentPage: string; setPage: (p: string) => void }> = ({ children, currentPage, setPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F6F3EB] text-slate-800 overflow-hidden">
      <Sidebar currentPage={currentPage} setPage={setPage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto study-gradient">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-[#F6F3EB]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-800">StudyPlanner</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:text-slate-800">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col p-4 md:p-8">
          {/* Decorative Top Right Gradient */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/10 blur-[80px] md:blur-[120px] rounded-full -z-10 pointer-events-none" />
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex min-w-0 flex-1 flex-col"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

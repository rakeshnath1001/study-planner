import React, { useState } from 'react';
import { AuthProvider, useAuth, StudyProvider } from './lib/contexts';
import { Layout } from './components/Navigation';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Activity } from './pages/Activity';
import { Productivity } from './pages/Productivity';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import { GoalDetail } from './pages/GoalDetail';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3EB] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-purple neubrutalism-purple flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-display font-bold italic tracking-tighter uppercase mb-1">INITIALIZING<br /><span className="text-brand-purple">Study Planner</span></h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Syncing with global clusters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleGoalClick = (goalId: string) => {
    setSelectedGoalId(goalId);
    setCurrentPage('goal-detail');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onAddTask={() => setCurrentPage('activity')} />;
      case 'activity': return <Activity onGoalClick={handleGoalClick} />;
      case 'productivity': return <Productivity />;
      case 'calendar': return <Calendar />;
      case 'profile': return <Profile />;
      case 'goal-detail': return <GoalDetail goalId={selectedGoalId!} onBack={() => setCurrentPage('activity')} />;
      default: return <Dashboard onAddTask={() => setCurrentPage('activity')} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <AppContent />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              fontWeight: 'bold',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
      </StudyProvider>
    </AuthProvider>
  );
}

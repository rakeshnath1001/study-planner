export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  productivityScore: number;
  totalStudyHours: number;
  totalCompletedTasks: number;
  streak: number;
  lastActiveDate: string | null;
  updatedAt: any;
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  duration: number; // in minutes
  date: string; // YYYY-MM-DD
  createdAt: any;
  updatedAt: any;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'active' | 'completed';
  progress: number;
  createdAt: any;
  updatedAt: any;
}

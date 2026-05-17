import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, getDocs, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './firebase';
import { UserProfile, Task, Goal } from '../types';
import { OperationType, handleFirestoreError } from './errorHandlers';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName,
              photoURL: user.photoURL,
              productivityScore: 0,
              totalStudyHours: 0,
              totalCompletedTasks: 0,
              streak: 0,
              lastActiveDate: new Date().toISOString(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            // Subscribe to profile changes
            return onSnapshot(userRef, (doc) => {
              setProfile(doc.data() as UserProfile);
            });
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => auth.signOut();

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Study Context
interface StudyContextType {
  tasks: Task[];
  goals: Goal[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setGoals([]);
      return;
    }

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'goals'));

    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, [user]);

  useEffect(() => {
    if (!user || tasks.length === 0) return;

    const syncProfileStats = async () => {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const totalHours = completedTasks.reduce((acc, t) => acc + (t.duration / 60), 0);
      const score = completedTasks.length * 50 + Math.floor(totalHours * 10);
      
      // Calculate streak (simple version)
      const taskDates = [...new Set(completedTasks.map(t => t.date))].sort().reverse() as string[];
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (taskDates.length > 0 && (taskDates[0] === today || taskDates[0] === yesterday)) {
        streak = 1;
        for (let i = 0; i < taskDates.length - 1; i++) {
          const d1Str = taskDates[i];
          const d2Str = taskDates[i + 1];
          if (d1Str && d2Str) {
            const d1 = new Date(d1Str);
            const d2 = new Date(d2Str);
            const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      const updates = {
        totalCompletedTasks: completedTasks.length,
        totalStudyHours: Math.round(totalHours * 10) / 10,
        productivityScore: score,
        streak: streak,
        lastActiveDate: new Date().toISOString(),
      };

      // Only update if changed (prevents infinite loop if subscription triggers this)
      if (
        profile && (
          profile.totalCompletedTasks !== updates.totalCompletedTasks ||
          profile.totalStudyHours !== updates.totalStudyHours ||
          profile.productivityScore !== updates.productivityScore ||
          profile.streak !== updates.streak
        )
      ) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            ...updates,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error syncing profile stats", error);
        }
      }
    };

    syncProfileStats();
  }, [tasks, user, profile]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      if (updates.status) {
        toast.success(updates.status === 'completed' ? 'Task completed!' : 'Task reopened');
      } else {
        toast.success('Task updated');
      }
    } catch (error) {
      toast.error('Failed to update task');
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'goals'), {
        ...goal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Goal established successfully');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to create goal');
      handleFirestoreError(error, OperationType.CREATE, 'goals');
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await updateDoc(doc(db, 'goals', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success('Goal updated');
    } catch (error) {
      toast.error('Failed to update goal');
      handleFirestoreError(error, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
      handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
    }
  };

  return (
    <StudyContext.Provider value={{ tasks, goals, addTask, updateTask, deleteTask, addGoal, updateGoal, deleteGoal }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAuth, useStudy } from '../lib/contexts';
import { Modal, Button } from './ui/Base';
import { toast } from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, defaultDate }) => {
  const { user } = useAuth();
  const { addTask } = useStudy();
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    priority: 'medium' as const,
    duration: 30,
    date: format(defaultDate || new Date(), 'yyyy-MM-dd')
  });

  React.useEffect(() => {
    if (isOpen) {
      setNewTask({
        title: '',
        category: '',
        priority: 'medium',
        duration: 30,
        date: format(defaultDate || new Date(), 'yyyy-MM-dd')
      });
    }
  }, [isOpen, defaultDate]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      await addTask({
        userId: user.uid,
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        duration: newTask.duration,
        status: 'pending',
        date: newTask.date,
      });
      setNewTask({ title: '', category: '', priority: 'medium', duration: 30, date: format(new Date(), 'yyyy-MM-dd') });
      toast.success('Task created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleAddTask} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Task Title</label>
          <input
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all text-slate-900"
            placeholder="e.g. Quantum Physics Revision"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Category</label>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all text-slate-900"
              placeholder="Subject/Topic"
              value={newTask.category}
              onChange={e => setNewTask({ ...newTask, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Duration (min)</label>
            <input
              type="number"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all text-slate-900"
              value={newTask.duration}
              onChange={e => setNewTask({ ...newTask, duration: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Priority</label>
            <select
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all text-slate-900"
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Date</label>
            <input
              type="date"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all text-slate-900"
              value={newTask.date}
              onChange={e => setNewTask({ ...newTask, date: e.target.value })}
            />
          </div>
        </div>
        <Button variant="neubrutal" className="w-full mt-4" disabled={loading}>
          {loading ? 'Adding...' : 'Add Study Task'}
        </Button>
      </form>
    </Modal>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-3 sm:p-6"
          >
            <div className="glass overflow-hidden rounded-2xl border-slate-200 bg-white/90 shadow-2xl sm:rounded-[32px]">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 p-4 sm:p-6">
                <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-8">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neubrutal';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const variants = {
    primary: 'btn-indigo shadow-lg shadow-indigo-500/20 text-white',
    secondary: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    ghost: 'hover:bg-slate-100 text-slate-500 hover:text-slate-900',
    neubrutal: 'btn-indigo shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] hover:shadow-none hover:translate-y-[4px] hover:translate-x-[4px] text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 rounded-2xl',
    lg: 'px-8 py-4 text-lg font-bold rounded-2xl',
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const success = useCallback((message: string, title: string = 'Uğurlu Əməliyyat') => {
    toast('success', title, message);
  }, [toast]);

  const error = useCallback((message: string, title: string = 'Xəta Baş Verdi') => {
    toast('error', title, message);
  }, [toast]);

  const info = useCallback((message: string, title: string = 'Məlumat') => {
    toast('info', title, message);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div 
        id="toast-notifications-container" 
        className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastItemProps {
  key?: string;
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);

    const intervalStep = 50; // ms
    const totalTime = 4000;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (intervalStep / totalTime) * 100;
        return next > 0 ? next : 0;
      });
    }, intervalStep);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 height-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 height-5 text-red-500" />,
    info: <Info className="w-5 height-5 text-indigo-500" />
  };

  const borderColors = {
    success: 'border-emerald-500/20 bg-white shadow-emerald-100/30',
    error: 'border-red-500/20 bg-white shadow-red-100/30',
    info: 'border-indigo-500/20 bg-white shadow-indigo-100/30'
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500'
  };

  return (
    <div
      id={`toast-item-${toast.id}`}
      className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 ${borderColors[toast.type]}`}
      role="alert"
    >
      <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800 font-sans leading-tight">{toast.title}</h4>
        <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Countdown Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 transition-all duration-75 ease-linear"
        style={{
          width: `${progress}%`,
        }}
        id={`toast-progress-${toast.id}`}
      >
        <div className={`w-full h-full ${progressColors[toast.type]} opacity-80`} />
      </div>
    </div>
  );
}

'use client';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success'|'error'| 'info' | 'warning';

interface ToastProps {
  message:string;
  type?: ToastType;
  onClose?:()=> void;
  className?: string;
}

export default function Toast({ 
  message, 
  type = 'info', 
  onClose,
  className = '' 
}: ToastProps) {
  const colors = {
    success: { 
      bg: 'bg-green-50 dark:bg-green-900/50', 
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: { 
      bg:'bg-red-50 dark:bg-red-900/50', 
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    info:{ 
      bg: 'bg-blue-50 dark:bg-blue-900/50', 
      border:'border-blue-200 dark:border-blue-800',
      text:'text-blue-700 dark:text-blue-200',
      icon:(
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning:{ 
      bg: 'bg-yellow-50 dark:bg-yellow-900/50', 
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
  };

  const c = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative flex items-start p-4 mb-2 rounded-lg border ${c.bg} ${c.border} ${className}`}
      role="alert"
    >
      <div className={`flex-shrink-0 mt-0.5 ${c.text}`}>
        {c.icon}
      </div>
      <div className={`ml-3 text-sm font-medium ${c.text}`}>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-auto -mx-1.5 -my-1.5 ${c.text} hover:opacity-75 rounded-lg p-1.5 inline-flex h-8 w-8`}
          aria-label="Close"
        >
          <span className="sr-only">Kapat</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

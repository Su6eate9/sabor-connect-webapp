import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'like' | 'favorite';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <span className="text-2xl">✅</span>;
      case 'error':
        return <span className="text-2xl">❌</span>;
      case 'warning':
        return <span className="text-2xl">⚠️</span>;
      case 'like':
        return <span className="text-2xl">❤️</span>;
      case 'favorite':
        return <span className="text-2xl">⭐</span>;
      default:
        return <span className="text-2xl">ℹ️</span>;
    }
  };

  const getStyles = () => {
    const baseStyles = 'bg-white dark:bg-gray-800 border shadow-lg';

    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      case 'like':
        return `${baseStyles} border-red-500`;
      case 'favorite':
        return `${baseStyles} border-yellow-500`;
      default:
        return `${baseStyles} border-blue-500`;
    }
  };

  return (
    <div
      className={`${getStyles()} rounded-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}
      role="alert"
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xl font-bold"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
};

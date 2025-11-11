import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  icon,
  loading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const iconMap = {
    danger: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  };

  const colorMap = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
        {/* Icon */}
        <div className="flex items-center justify-center pt-8">
          <div
            className={`w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl ${colorMap[type]}`}
          >
            {icon || iconMap[type]}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="sm:min-w-[120px]"
            >
              {cancelText}
            </Button>
            <Button
              variant={type === 'danger' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              disabled={loading}
              className="sm:min-w-[120px]"
            >
              {loading ? 'Processando...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

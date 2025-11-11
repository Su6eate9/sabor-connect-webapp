import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon = '📭',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`card p-12 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-4">
          {typeof icon === 'string' ? (
            <div className="text-6xl animate-bounce">{icon}</div>
          ) : (
            icon
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

        {/* Action */}
        {action && <div className="flex justify-center">{action}</div>}
      </div>
    </div>
  );
};

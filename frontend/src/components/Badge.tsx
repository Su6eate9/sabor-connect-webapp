interface BadgeProps {
  variant?: 'new' | 'popular' | 'trending' | 'featured' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => {
  const variantClasses = {
    new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    popular: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    trending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    featured: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  const icons = {
    new: '🆕',
    popular: '🔥',
    trending: '📈',
    featured: '⭐',
    default: '',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {icons[variant] && <span>{icons[variant]}</span>}
      <span>{children}</span>
    </span>
  );
};

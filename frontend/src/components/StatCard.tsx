import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const colorClasses = {
  primary: 'from-primary/10 to-primary/5 text-primary',
  secondary: 'from-secondary/10 to-secondary/5 text-secondary',
  success:
    'from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10 text-green-600 dark:text-green-400',
  warning:
    'from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-900/10 text-yellow-600 dark:text-yellow-400',
  danger:
    'from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/10 text-red-600 dark:text-red-400',
};

export const StatCard = ({ label, value, icon, trend, color = 'primary' }: StatCardProps) => {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
    </div>
  );
};

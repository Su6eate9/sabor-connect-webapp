import { ReactNode } from 'react';

interface Activity {
  id: string;
  type: 'recipe_created' | 'recipe_liked' | 'comment_added' | 'recipe_favorited';
  title: string;
  description?: string;
  timestamp: Date;
  icon: ReactNode;
  color: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'agora mesmo';
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `há ${Math.floor(seconds / 86400)}d`;
  return `há ${Math.floor(seconds / 604800)} sem`;
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-lg">Nenhuma atividade recente</p>
        <p className="text-sm mt-2">Suas atividades aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4 group">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              {activity.icon}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  {timeAgo(activity.timestamp)}
                </span>
              </div>
              {activity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

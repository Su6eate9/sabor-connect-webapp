import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Star, Clock } from 'lucide-react';
import { Recipe } from '@/types';
import { formatDate } from '@/lib/utils';

interface FeedItem {
  id: string;
  type: 'new_recipe' | 'liked' | 'commented' | 'favorited';
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  recipe: Recipe;
  timestamp: Date;
  comment?: string;
}

interface SocialFeedProps {
  items: FeedItem[];
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ items }) => {
  const getActionText = (type: FeedItem['type']) => {
    switch (type) {
      case 'new_recipe':
        return 'publicou uma nova receita';
      case 'liked':
        return 'curtiu';
      case 'commented':
        return 'comentou em';
      case 'favorited':
        return 'favoritou';
      default:
        return 'interagiu com';
    }
  };

  const getActionIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'new_recipe':
        return <span className="text-2xl">📖</span>;
      case 'liked':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'commented':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'favorited':
        return <Star className="w-5 h-5 text-yellow-500 fill-current" />;
      default:
        return <span className="text-2xl">✨</span>;
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
          Nenhuma atividade recente
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Comece seguindo outros usuários para ver suas atividades aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="card p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex gap-4">
            {/* User Avatar */}
            <Link to={`/profile/${item.user.id}`} className="flex-shrink-0">
              {item.user.avatarUrl ? (
                <img
                  src={item.user.avatarUrl}
                  alt={item.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {item.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/profile/${item.user.id}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-400"
                  >
                    {item.user.name}
                  </Link>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {getActionText(item.type)}
                  </span>
                  <div className="flex items-center gap-1">
                    {getActionIcon(item.type)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(item.timestamp.toISOString())}</span>
                </div>
              </div>

              {/* Recipe Info */}
              <Link
                to={`/recipes/${item.recipe.slug}`}
                className="block group"
              >
                <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  {/* Recipe Image */}
                  {item.recipe.coverImageUrl && (
                    <img
                      src={item.recipe.coverImageUrl}
                      alt={item.recipe.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  {/* Recipe Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                      {item.recipe.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {item.recipe.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.recipe._count?.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {item.recipe._count?.comments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {item.recipe._count?.favorites || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Comment (if exists) */}
              {item.comment && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    "{item.comment}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

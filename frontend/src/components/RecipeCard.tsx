import { Link } from 'react-router-dom';
import { Recipe } from '@/types';
import { getImageUrl, getRecipePlaceholderImage, formatTime, truncate } from '@/lib/utils';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const imageUrl = recipe.coverImageUrl
    ? getImageUrl(recipe.coverImageUrl)
    : getRecipePlaceholderImage(recipe.title);

  return (
    <Link to={`/recipes/${recipe.slug}`} className="card group">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 dark:from-orange-600 dark:via-rose-600 dark:to-pink-700">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              DIFFICULTY_COLORS[recipe.difficulty]
            }`}
          >
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary text-gray-900 dark:text-white transition">
          {recipe.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {truncate(recipe.description, 100)}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-300 mb-4">
          <span>⏱️ {formatTime(recipe.prepTimeMinutes + recipe.cookTimeMinutes)}</span>
          <span>👥 {recipe.portions} porções</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {recipe.author.avatarUrl ? (
              <img
                src={getImageUrl(recipe.author.avatarUrl)}
                alt={recipe.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {recipe.author.name[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {recipe.author.name}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <span>❤️</span>
              <span>{recipe._count?.likes || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>💬</span>
              <span>{recipe._count?.comments || 0}</span>
            </span>
          </div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

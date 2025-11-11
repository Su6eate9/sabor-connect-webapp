interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const Loading = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
}: LoadingProps) => {
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={`${sizeClasses[size]} border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin`}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${
                  size === 'sm'
                    ? 'w-2 h-2'
                    : size === 'md'
                      ? 'w-3 h-3'
                      : size === 'lg'
                        ? 'w-4 h-4'
                        : 'w-5 h-5'
                } bg-primary rounded-full animate-bounce`}
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div
              className={`${sizeClasses[size]} bg-primary rounded-full animate-ping absolute opacity-75`}
            />
            <div className={`${sizeClasses[size]} bg-primary rounded-full`} />
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1.5 items-end">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`${
                  size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-2.5'
                } bg-primary rounded-full`}
                style={{
                  height:
                    size === 'sm'
                      ? '12px'
                      : size === 'md'
                        ? '20px'
                        : size === 'lg'
                          ? '28px'
                          : '36px',
                  animation: `loading-bars 1s ease-in-out ${index * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[250] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Add to index.css for bars animation:
/*
@keyframes loading-bars {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}
*/

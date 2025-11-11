interface UploadProgressProps {
  fileName: string;
  progress: number;
  onCancel?: () => void;
  isComplete?: boolean;
  error?: string;
}

export const UploadProgress = ({
  fileName,
  progress,
  onCancel,
  isComplete = false,
  error,
}: UploadProgressProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            error
              ? 'bg-red-100 dark:bg-red-900'
              : isComplete
                ? 'bg-green-100 dark:bg-green-900'
                : 'bg-blue-100 dark:bg-blue-900'
          }`}
        >
          {error ? (
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : isComplete ? (
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
            {!isComplete && !error && onCancel && (
              <button
                onClick={onCancel}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Cancelar upload"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : isComplete ? (
            <p className="text-sm text-green-600 dark:text-green-400">Upload concluído</p>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}% concluído</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface MultipleUploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    progress: number;
    isComplete?: boolean;
    error?: string;
  }>;
  onCancelUpload?: (id: string) => void;
  onClearCompleted?: () => void;
}

export const MultipleUploadProgress = ({
  uploads,
  onCancelUpload,
  onClearCompleted,
}: MultipleUploadProgressProps) => {
  if (uploads.length === 0) return null;

  const completedCount = uploads.filter((u) => u.isComplete).length;
  const hasCompleted = completedCount > 0;

  return (
    <div className="fixed bottom-6 right-6 z-[150] max-w-md w-full space-y-3">
      {/* Header */}
      {uploads.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Uploads ({completedCount}/{uploads.length})
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {uploads.length - completedCount > 0
                  ? `${uploads.length - completedCount} em andamento`
                  : 'Todos concluídos'}
              </p>
            </div>
            {hasCompleted && onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {uploads.map((upload) => (
          <UploadProgress
            key={upload.id}
            fileName={upload.fileName}
            progress={upload.progress}
            isComplete={upload.isComplete}
            error={upload.error}
            onCancel={onCancelUpload ? () => onCancelUpload(upload.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

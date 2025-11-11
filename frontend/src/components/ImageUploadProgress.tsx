interface ImageUploadProgressProps {
  isUploading: boolean;
  fileName?: string;
}

export const ImageUploadProgress = ({ isUploading, fileName }: ImageUploadProgressProps) => {
  if (!isUploading) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {fileName ? `Processando ${fileName}...` : 'Processando imagem...'}
          </p>
        </div>
      </div>

      {/* Progress bar with animation */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full animate-upload-progress"
          style={{ width: '100%' }}
        ></div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        Aguarde enquanto a imagem está sendo processada...
      </p>
    </div>
  );
};

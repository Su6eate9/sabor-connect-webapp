import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  onUpload,
  isUploading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Enviar arquivo
    onUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt={userName}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold border-4 border-gray-200 dark:border-gray-700">
            {userName[0]?.toUpperCase()}
          </div>
        )}

        {/* Overlay com botão de camera */}
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
        >
          <span className="text-4xl opacity-0 group-hover:opacity-100 transition-opacity">📷</span>
        </button>

        {/* Badge de loading */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Botão de remover preview */}
        {preview && !isUploading && (
          <button
            onClick={handleRemovePreview}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors font-bold text-lg"
            aria-label="Remover preview"
          >
            ×
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <Button onClick={handleClick} disabled={isUploading} variant="outline">
        {isUploading ? 'Enviando...' : 'Alterar Foto'}
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        JPG, PNG ou GIF (máx. 5MB)
      </p>
    </div>
  );
};

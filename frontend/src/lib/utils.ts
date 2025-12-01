export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora há pouco';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  return formatDate(date);
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const getImageUrl = (path?: string): string => {
  if (!path) return '/placeholder-recipe.jpg';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${path}`;
};

export const getRecipePlaceholderImage = (recipeName: string): string => {
  // Usa Picsum Photos para gerar imagens placeholder
  // Gera um ID baseado no nome da receita para consistência
  const seed = recipeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageId = (seed % 1000) + 1; // IDs de 1 a 1000
  return `https://picsum.photos/seed/${imageId}/800/600`;
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

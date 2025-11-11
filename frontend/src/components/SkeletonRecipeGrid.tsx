import { SkeletonCard } from './SkeletonCard';

interface SkeletonRecipeGridProps {
  count?: number;
}

export const SkeletonRecipeGrid = ({ count = 6 }: SkeletonRecipeGridProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

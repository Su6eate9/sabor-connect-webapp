import { useState } from 'react';
import { Button } from './Button';

interface FilterOption {
  label: string;
  value: string;
}

interface AdvancedFiltersProps {
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
}

export interface FilterValues {
  difficulty?: string;
  prepTime?: string;
  portions?: string;
  sortBy?: string;
}

export const AdvancedFilters = ({ onApply, onReset }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  const difficultyOptions: FilterOption[] = [
    { label: 'Todas', value: '' },
    { label: 'Fácil', value: 'EASY' },
    { label: 'Médio', value: 'MEDIUM' },
    { label: 'Difícil', value: 'HARD' },
  ];

  const prepTimeOptions: FilterOption[] = [
    { label: 'Qualquer tempo', value: '' },
    { label: 'Até 30 minutos', value: '0-30' },
    { label: '30-60 minutos', value: '30-60' },
    { label: '1-2 horas', value: '60-120' },
    { label: 'Mais de 2 horas', value: '120+' },
  ];

  const portionsOptions: FilterOption[] = [
    { label: 'Qualquer quantidade', value: '' },
    { label: '1-2 porções', value: '1-2' },
    { label: '3-4 porções', value: '3-4' },
    { label: '5-6 porções', value: '5-6' },
    { label: 'Mais de 6 porções', value: '6+' },
  ];

  const sortByOptions: FilterOption[] = [
    { label: 'Mais recentes', value: 'recent' },
    { label: 'Mais antigas', value: 'oldest' },
    { label: 'Mais curtidas', value: 'likes' },
    { label: 'Mais comentadas', value: 'comments' },
    { label: 'A-Z', value: 'title-asc' },
    { label: 'Z-A', value: 'title-desc' },
  ];

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v).length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-scale-in">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Filtros Avançados
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Dificuldade
                </label>
                <select
                  className="input"
                  value={filters.difficulty || ''}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prep Time */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tempo de Preparo
                </label>
                <select
                  className="input"
                  value={filters.prepTime || ''}
                  onChange={(e) => handleFilterChange('prepTime', e.target.value)}
                >
                  {prepTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Portions */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Porções
                </label>
                <select
                  className="input"
                  value={filters.portions || ''}
                  onChange={(e) => handleFilterChange('portions', e.target.value)}
                >
                  {portionsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Ordenar por
                </label>
                <select
                  className="input"
                  value={filters.sortBy || 'recent'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  {sortByOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleReset} fullWidth>
                  Limpar
                </Button>
                <Button onClick={handleApply} fullWidth>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

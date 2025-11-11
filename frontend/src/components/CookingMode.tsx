import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Timer } from './Timer';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface CookingModeProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: string[];
  recipeTitle: string;
  ingredients?: Ingredient[];
}

export const CookingMode = ({
  isOpen,
  onClose,
  instructions,
  recipeTitle,
  ingredients = [],
}: CookingModeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [showIngredients, setShowIngredients] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Request fullscreen on mobile
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Fullscreen not supported or denied
        });
        setIsFullscreen(true);
      }
    } else {
      document.body.style.overflow = 'auto';
      if (document.exitFullscreen && isFullscreen) {
        document.exitFullscreen().catch(() => {
          // Already exited or error
        });
        setIsFullscreen(false);
      }
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isFullscreen]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / instructions.length) * 100;

  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleToggleComplete = () => {
    if (completedSteps.includes(currentStep)) {
      setCompletedSteps(completedSteps.filter((s) => s !== currentStep));
    } else {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-white dark:bg-gray-900"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👨‍🍳</span>
              <div>
                <h2 className="text-lg font-bold">Modo Cozinhando</h2>
                <p className="text-sm opacity-90">{recipeTitle}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Sair do modo cozinhando"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mt-4">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs opacity-90">
            <span>
              Passo {currentStep + 1} de {instructions.length}
            </span>
            <span>{Math.round(progress)}% completo</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-6xl mx-auto">
        {/* Timer - Fixed Position */}
        <div className="absolute top-32 right-6 z-10">
          <Timer />
        </div>

        {/* Ingredients Sidebar */}
        {ingredients.length > 0 && (
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="absolute top-32 left-6 z-10 flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
            aria-label={showIngredients ? 'Ocultar ingredientes' : 'Mostrar ingredientes'}
          >
            <span className="text-xl">📝</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Ingredientes ({checkedIngredients.size}/{ingredients.length})
            </span>
          </button>
        )}

        {showIngredients && ingredients.length > 0 && (
          <div className="absolute top-52 left-6 z-10 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Lista de Ingredientes</span>
              <button
                onClick={() => setShowIngredients(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar lista"
              >
                ×
              </button>
            </h3>
            <div className="space-y-2">
              {ingredients.map((ingredient) => (
                <label
                  key={ingredient.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checkedIngredients.has(ingredient.id)}
                    onChange={() => {
                      const newChecked = new Set(checkedIngredients);
                      if (newChecked.has(ingredient.id)) {
                        newChecked.delete(ingredient.id);
                      } else {
                        newChecked.add(ingredient.id);
                      }
                      setCheckedIngredients(newChecked);
                    }}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                  <span
                    className={`flex-1 ${checkedIngredients.has(ingredient.id) ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}
                  >
                    <span className="font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </span>{' '}
                    {ingredient.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      completedSteps.includes(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {completedSteps.includes(currentStep) ? '✓' : currentStep + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl text-gray-900 dark:text-white leading-relaxed">
                    {instructions[currentStep]}
                  </p>
                  <button
                    onClick={handleToggleComplete}
                    className={`mt-6 px-6 py-3 rounded-lg font-medium transition-colors ${
                      completedSteps.includes(currentStep)
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {completedSteps.includes(currentStep) ? '✓ Concluído' : 'Marcar como concluído'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Step Indicators */}
            <div className="flex justify-center space-x-2 mb-6 overflow-x-auto pb-2">
              {instructions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full font-medium transition-all ${
                    index === currentStep
                      ? 'bg-primary text-white scale-110'
                      : completedSteps.includes(index)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`Ir para passo ${index + 1}`}
                  aria-current={index === currentStep ? 'step' : undefined}
                >
                  {completedSteps.includes(index) ? '✓' : index + 1}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="min-w-[140px]"
              >
                ← Anterior
              </Button>

              <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                Use as setas ← → ou espaço para navegar
              </div>

              {currentStep < instructions.length - 1 ? (
                <Button onClick={handleNext} className="min-w-[140px]">
                  Próximo →
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
                >
                  🎉 Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

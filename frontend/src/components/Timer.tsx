import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface TimerProps {
  className?: string;
}

export const Timer = ({ className = '' }: TimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  if (!showTimer) {
    return (
      <button
        onClick={() => setShowTimer(true)}
        className={`flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all ${className}`}
        aria-label="Abrir timer"
      >
        <span className="text-xl">⏱️</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">Timer</span>
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">⏱️</span>
          <h3 className="font-bold text-gray-900 dark:text-white">Timer</h3>
        </div>
        <button
          onClick={() => {
            setShowTimer(false);
            handleReset();
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Fechar timer"
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

      <div className="text-center mb-4">
        <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white tabular-nums">
          {formatTime(time)}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleStartPause}
          variant={isRunning ? 'outline' : 'primary'}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <span className="mr-2">⏸️</span>
              Pausar
            </>
          ) : (
            <>
              <span className="mr-2">▶️</span>
              Iniciar
            </>
          )}
        </Button>
        <Button onClick={handleReset} variant="outline" disabled={time === 0}>
          <span>🔄</span>
        </Button>
      </div>

      {time > 0 && (
        <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {isRunning ? 'Timer em andamento...' : 'Timer pausado'}
        </div>
      )}
    </div>
  );
};

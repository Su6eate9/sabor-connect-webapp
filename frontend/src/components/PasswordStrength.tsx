import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthLevel {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    let score = 0;

    if (!password) return null;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Contains lowercase
    if (/[a-z]/.test(password)) score++;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score++;

    // Contains number
    if (/\d/.test(password)) score++;

    // Contains special character
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels: StrengthLevel[] = [
      {
        score: 1,
        label: 'Muito Fraca',
        color: 'text-red-600',
        bgColor: 'bg-red-600',
      },
      {
        score: 2,
        label: 'Fraca',
        color: 'text-orange-600',
        bgColor: 'bg-orange-600',
      },
      {
        score: 3,
        label: 'Média',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-600',
      },
      {
        score: 4,
        label: 'Boa',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600',
      },
      {
        score: 5,
        label: 'Forte',
        color: 'text-green-600',
        bgColor: 'bg-green-600',
      },
      {
        score: 6,
        label: 'Muito Forte',
        color: 'text-green-700',
        bgColor: 'bg-green-700',
      },
    ];

    return levels.find((level) => level.score === Math.min(score, 6)) || levels[0];
  }, [password]);

  if (!strength) return null;

  const getWidthPercentage = () => {
    return (strength.score / 6) * 100;
  };

  const requirements = [
    { met: password.length >= 8, text: 'Pelo menos 8 caracteres' },
    { met: /[a-z]/.test(password), text: 'Letra minúscula' },
    { met: /[A-Z]/.test(password), text: 'Letra maiúscula' },
    { met: /\d/.test(password), text: 'Número' },
    { met: /[^a-zA-Z0-9]/.test(password), text: 'Caractere especial' },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
          <span className={`font-medium ${strength.color}`}>{strength.label}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.bgColor} transition-all duration-300`}
            style={{ width: `${getWidthPercentage()}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="text-xs space-y-1">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 ${
              req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              {req.met ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

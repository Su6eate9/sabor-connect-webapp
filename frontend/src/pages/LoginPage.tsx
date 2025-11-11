import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { FieldError } from '@/components/FieldError';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { ROUTES } from '@/lib/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { errors, handleBlur, handleChange, validateAll } = useFormValidation({
    email: [validationRules.required('E-mail é obrigatório'), validationRules.email()],
    password: [validationRules.required('Senha é obrigatória'), validationRules.minLength(6)],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!validateAll({ email, password })) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2 text-gray-900 dark:text-white">
              Entrar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Bem-vindo de volta ao SaborConnect!</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className={`input ${errors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    handleChange('email', e.target.value);
                  }}
                  onBlur={() => handleBlur('email', email)}
                />
                <FieldError error={errors.email} />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  className={`input ${errors.password ? 'border-red-500 dark:border-red-400' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleChange('password', e.target.value);
                  }}
                  onBlur={() => handleBlur('password', password)}
                />
                <FieldError error={errors.password} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Não tem uma conta? </span>
              <Link
                to={ROUTES.REGISTER}
                className="text-primary dark:text-primary-400 font-medium hover:underline"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

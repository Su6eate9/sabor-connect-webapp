import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { PasswordStrength } from '@/components/PasswordStrength';
import { FieldError } from '@/components/FieldError';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { ROUTES } from '@/lib/constants';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    errors,
    handleBlur,
    handleChange: handleValidationChange,
    validateAll,
  } = useFormValidation({
    name: [
      validationRules.required('Nome é obrigatório'),
      validationRules.minLength(2, 'Nome deve ter pelo menos 2 caracteres'),
    ],
    email: [validationRules.required('E-mail é obrigatório'), validationRules.email()],
    password: [
      validationRules.required('Senha é obrigatória'),
      validationRules.minLength(8, 'Senha deve ter pelo menos 8 caracteres'),
    ],
    confirmPassword: [validationRules.required('Confirmação de senha é obrigatória')],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    handleValidationChange(name, value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!validateAll(formData)) {
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao criar conta');
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
              Criar Conta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Junte-se à comunidade SaborConnect e comece a compartilhar suas receitas!
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert type="error" message={error} onClose={() => setError('')} />}

              <Input
                id="name"
                name="name"
                type="text"
                label="Nome completo"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name', formData.name)}
                error={errors.name}
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email', formData.email)}
                error={errors.email}
              />

              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Senha"
                  placeholder="Crie uma senha forte"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password', formData.password)}
                  error={errors.password}
                />
                <PasswordStrength password={formData.password} />
              </div>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirmar senha"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword', formData.confirmPassword)}
                error={
                  errors.confirmPassword ||
                  (formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'As senhas não coincidem'
                    : '')
                }
              />

              <Button type="submit" disabled={loading} fullWidth>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Já tem uma conta? </span>
              <Link
                to={ROUTES.LOGIN}
                className="text-primary dark:text-primary-400 font-medium hover:underline"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

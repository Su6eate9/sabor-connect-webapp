import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.name.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
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
                required
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="E-mail"
                required
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Senha"
                required
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                helperText="Mínimo 6 caracteres"
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirmar senha"
                required
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange}
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

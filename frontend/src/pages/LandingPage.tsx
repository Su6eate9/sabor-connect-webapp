import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 py-20 transition-colors duration-200">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6">
            Compartilhe <span className="text-primary">Sabores</span>,<br />
            Descubra <span className="text-secondary">Receitas</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Una-se à nossa comunidade culinária e explore milhares de receitas deliciosas
            compartilhadas por cozinheiros apaixonados como você.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to={ROUTES.REGISTER} className="btn-primary text-lg px-8 py-3">
              Começar Agora
            </Link>
            <Link to={ROUTES.RECIPES} className="btn-outline text-lg px-8 py-3">
              Explorar Receitas
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 container-custom bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-display font-bold text-center mb-12 text-gray-900 dark:text-white">
          Por que SaborConnect?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Receitas Detalhadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Instruções passo a passo com ingredientes, tempo e dificuldade
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Comunidade Ativa
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Compartilhe, comente e avalie receitas com outros entusiastas
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Busca Inteligente
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Encontre exatamente o que procura com filtros avançados
            </p>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="bg-gray-100 dark:bg-gray-800 py-16">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-display font-bold mb-6 text-gray-900 dark:text-white">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Cadastre-se gratuitamente e comece a compartilhar suas receitas hoje!
            </p>
            <Link to={ROUTES.REGISTER} className="btn-primary text-lg px-8 py-3">
              Criar Conta Grátis
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
};

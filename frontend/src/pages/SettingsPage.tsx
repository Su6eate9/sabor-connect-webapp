import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import api from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { ApiResponse, User } from '@/types';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put<ApiResponse<User>>('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data) {
        updateUser(data.data);
        queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
        showToast('Perfil atualizado com sucesso! ✅', 'success');
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error?.message || 'Erro ao atualizar perfil';
      showToast(errorMsg, 'error');
    },
  });

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    updateProfileMutation.mutate(formData);
  };

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: ROUTES.HOME },
              { label: 'Meu Perfil', href: `/profile/${user.id}` },
              { label: 'Configurações' },
            ]}
          />

          <div className="max-w-2xl mx-auto mt-8">
            {/* Header */}
            <div className="card p-8 mb-6">
              <h1 className="text-3xl font-display font-bold mb-2 text-gray-900 dark:text-white">
                Configurações do Perfil
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Atualize suas informações pessoais e foto de perfil
              </p>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSubmit} className="card p-8">
              {/* Avatar Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Foto de Perfil
                </label>
                <AvatarUpload
                  currentAvatar={avatarPreview || undefined}
                  onUpload={handleAvatarUpload}
                  userName={user.name}
                  isUploading={updateProfileMutation.isPending}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
                </p>
              </div>

              {/* Name */}
              <div className="mb-6">
                <Input
                  label="Nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <Textarea
                  label="Biografia"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você e sua paixão pela culinária..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {bio.length}/500 caracteres
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="mb-8">
                <Input
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="card p-8 mt-6 border-2 border-red-200 dark:border-red-900">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Zona de Perigo
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ações irreversíveis que afetam sua conta
              </p>
              <Button variant="danger" onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}>
                Excluir Conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

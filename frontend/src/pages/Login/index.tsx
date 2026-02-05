import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login', data);
      const { user, access_token } = response.data;
      
      login(user, access_token);
      toast.success(`Bem-vindo, ${user.nome}!`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Erro ao realizar login';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Aesthetics */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">JS Beauty</h1>
            <p className="text-purple-100">Gestão Profissional</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200'
                  } focus:outline-none focus:ring-4 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="seu@email.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 pl-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.senha ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200'
                  } focus:outline-none focus:ring-4 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="••••••"
                  {...register('senha')}
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-500 pl-1">{errors.senha.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Esqueceu sua senha?{' '}
            <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
              Contate o administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

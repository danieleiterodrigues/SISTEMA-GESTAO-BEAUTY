import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import type { Cliente, CreateClienteData } from '../../services/clientesService';
import { useEffect } from 'react';

const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
  dataNascimento: z.string().optional().or(z.literal('')),
});

type ClienteFormSchema = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: Cliente | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClienteData) => Promise<void>;
}

const ClienteForm = ({ cliente, isOpen, onClose, onSave }: ClienteFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormSchema>({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        reset({
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email || '',
          cpf: cliente.cpf || '',
          dataNascimento: cliente.dataNascimento ? new Date(cliente.dataNascimento).toISOString().split('T')[0] : '',
        });
      } else {
        reset({
          nome: '',
          telefone: '',
          email: '',
          cpf: '',
          dataNascimento: '',
        });
      }
    }
  }, [isOpen, cliente, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ClienteFormSchema) => {
    // Sanitize empty strings to undefined so backend accepts them as optional
    const sanitizedData: any = { ...data };
    if (!sanitizedData.email) delete sanitizedData.email;
    if (!sanitizedData.cpf) delete sanitizedData.cpf;
    if (!sanitizedData.dataNascimento) delete sanitizedData.dataNascimento;
    
    await onSave(sanitizedData as CreateClienteData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              {...register('nome')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="Nome completo"
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              {...register('telefone')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="(00) 00000-0000"
            />
            {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                {...register('cpf')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Nasc.</label>
              <input
                type="date"
                {...register('dataNascimento')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="email@exemplo.com"
            />
             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import type { Servico, CreateServicoData } from '../../services/servicosService';
import { useEffect } from 'react';

const servicoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  duracaoMinutos: z.coerce.number().min(1, 'Duração deve ser maior que 0'),
  valor: z.coerce.number().min(0, 'Valor não pode ser negativo'),
  comissaoTipo: z.enum(['percentual', 'fixo']),
  comissaoValor: z.coerce.number().min(0, 'Comissão não pode ser negativa'),
});

type ServicoFormSchema = z.infer<typeof servicoSchema>;

interface ServicoFormProps {
  servico?: Servico | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateServicoData) => Promise<void>;
}

const ServicoForm = ({ servico, isOpen, onClose, onSave }: ServicoFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServicoFormSchema>({
    resolver: zodResolver(servicoSchema) as any,
    defaultValues: {
      comissaoTipo: 'percentual',
      duracaoMinutos: 30,
      valor: 0,
      comissaoValor: 0,
    },
  });

  const comissaoTipo = watch('comissaoTipo');

  useEffect(() => {
    if (isOpen) {
      if (servico) {
        reset({
          nome: servico.nome,
          descricao: servico.descricao || '',
          categoria: servico.categoria || '',
          duracaoMinutos: servico.duracaoMinutos,
          valor: Number(servico.valor),
          comissaoTipo: servico.comissaoTipo,
          comissaoValor: Number(servico.comissaoValor),
        });
      } else {
        reset({
          nome: '',
          descricao: '',
          categoria: '',
          duracaoMinutos: 30,
          valor: 0,
          comissaoTipo: 'percentual',
          comissaoValor: 0,
        });
      }
    }
  }, [isOpen, servico, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ServicoFormSchema) => {
    await onSave(data as CreateServicoData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {servico ? 'Editar Serviço' : 'Novo Serviço'}
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
              placeholder="Ex: Corte de Cabelo"
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                {...register('valor')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min) *</label>
              <input
                type="number"
                {...register('duracaoMinutos')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              {errors.duracaoMinutos && <p className="text-red-500 text-xs mt-1">{errors.duracaoMinutos.message}</p>}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Comissão</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  {...register('comissaoTipo')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
                >
                  <option value="percentual">Porcentagem (%)</option>
                  <option value="fixo">Valor Fixo (R$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {comissaoTipo === 'percentual' ? 'Porcentagem' : 'Valor'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('comissaoValor')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                {errors.comissaoValor && <p className="text-red-500 text-xs mt-1">{errors.comissaoValor.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
            <input
              {...register('categoria')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="Ex: Cabelo, Unhas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              {...register('descricao')}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              placeholder="Detalhes do serviço..."
            />
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

export default ServicoForm;

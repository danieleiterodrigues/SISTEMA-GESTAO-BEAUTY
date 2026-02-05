import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, Loader2, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import servicosService, { type Servico, type CreateServicoData } from '../../services/servicosService';
import ServicoForm from './ServicoForm';

const Servicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const data = await servicosService.getAll();
      setServicos(data);
    } catch (error) {
      toast.error('Erro ao carregar serviços');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleSave = async (data: CreateServicoData) => {
    try {
      if (editingServico) {
        await servicosService.update(editingServico.id, data);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await servicosService.create(data);
        toast.success('Serviço criado com sucesso!');
      }
      setIsModalOpen(false);
      setEditingServico(null);
      fetchServicos();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao salvar serviço';
      toast.error(msg);
    }
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;
    
    try {
      await servicosService.remove(id);
      toast.success('Serviço removido com sucesso');
      fetchServicos();
    } catch (error) {
      toast.error('Erro ao remover serviço');
    }
  };

  const handleNew = () => {
    setEditingServico(null);
    setIsModalOpen(true);
  };

  const filteredServicos = servicos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.categoria && s.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Scissors className="text-purple-600" />
            Serviços
          </h1>
          <p className="text-gray-500">Gerencie seu catálogo de serviços</p>
        </div>
        
        <button
          onClick={handleNew}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-200 transition-all hover:translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar serviço por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Duração</th>
                <th className="px-6 py-4">Comissão</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                       <Loader2 className="w-5 h-5 animate-spin text-purple-600" /> Carregando...
                    </div>
                  </td>
                </tr>
              ) : filteredServicos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum serviço encontrado.
                  </td>
                </tr>
              ) : (
                filteredServicos.map((servico) => (
                  <tr key={servico.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{servico.nome}</div>
                        {servico.categoria && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            {servico.categoria}
                          </span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-medium text-green-700 bg-green-50 w-fit px-2 py-1 rounded-md">
                        <DollarSign className="w-3 h-3" />
                         {Number(servico.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {servico.duracaoMinutos} min
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {servico.comissaoTipo === 'percentual' 
                          ? `${servico.comissaoValor}%` 
                          : `R$ ${Number(servico.comissaoValor).toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleEdit(servico)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(servico.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServicoForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        servico={editingServico}
      />
    </div>
  );
};

export default Servicos;

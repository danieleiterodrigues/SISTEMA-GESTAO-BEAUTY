import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clientesService, { type Cliente, type CreateClienteData } from '../../services/clientesService';
import ClienteForm from './ClienteForm';

import PostRegisterModal from './PostRegisterModal';

const Clientes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  
  // Post Register Modal State
  const [isPostRegisterOpen, setIsPostRegisterOpen] = useState(false);
  const [lastSavedCliente, setLastSavedCliente] = useState<{ id: number, nome: string } | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getAll();
      // Filter out inactive clients if business rule requires, or show them with status.
      // For now show all except deleted (server handles filtering usually, but here we see 'inativo' status).
      // Let's filtered out 'inativo' or keep them? Let's keep them and show badge.
      setClientes(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSave = async (data: CreateClienteData) => {
    try {
      if (editingCliente) {
        await clientesService.update(editingCliente.id, data);
        toast.success('Cliente atualizado com sucesso!');
        setIsModalOpen(false);
        setEditingCliente(null);
      } else {
        const newCliente = await clientesService.create(data);
        toast.success('Cliente criado com sucesso!');
        setIsModalOpen(false);
        setEditingCliente(null);
        
        // Show post-register actions
        setLastSavedCliente({ id: newCliente.id, nome: newCliente.nome });
        setIsPostRegisterOpen(true);
      }
      fetchClientes();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao salvar cliente';
      toast.error(msg);
    }
  };



  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    
    try {
      await clientesService.remove(id);
      toast.success('Cliente removido com sucesso');
      fetchClientes();
    } catch (error) {
      toast.error('Erro ao remover cliente');
    }
  };

  const handleNew = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone.includes(searchTerm) ||
    (c.cpf && c.cpf.includes(searchTerm))
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-purple-600" />
            Clientes
          </h1>
          <p className="text-gray-500">Gerencie sua base de clientes</p>
        </div>
        
        <button
          onClick={handleNew}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-200 transition-all hover:translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou CPF..."
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
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">CPF</th>
                <th className="px-6 py-4">Status</th>
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
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr 
                    key={cliente.id} 
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{cliente.nome}</div>
                        {cliente.email && <div className="text-sm text-gray-500">{cliente.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cliente.telefone}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{cliente.cpf || '-'}</td>
                     <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cliente.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        cliente.status === 'inativo' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cliente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id); }}
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

      <ClienteForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        cliente={editingCliente}
      />

      <PostRegisterModal
        isOpen={isPostRegisterOpen}
        onClose={() => setIsPostRegisterOpen(false)}
        clienteNome={lastSavedCliente?.nome || ''}
        onAddService={() => {
          setIsPostRegisterOpen(false);
          toast('Funcionalidade de Agendamento em breve!', { icon: '🗓️' });
        }}
        onAddPackage={() => {
          setIsPostRegisterOpen(false);
          toast('Funcionalidade de Pacotes em breve!', { icon: '📦' });
        }}
      />
    </div>
  );
};

export default Clientes;

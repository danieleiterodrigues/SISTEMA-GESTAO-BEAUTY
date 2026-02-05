import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Calendar, Package, DollarSign, Image, FileText, 
  ArrowLeft, Edit, Plus, Clock, CreditCard 
} from 'lucide-react';
import clientesService, { type Cliente, type CreateClienteData } from '../../services/clientesService';
import ClienteForm from './ClienteForm';
import NovoAtendimentoModal from '../../components/modals/NovoAtendimentoModal';
import toast from 'react-hot-toast';

const ClientePerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  useEffect(() => {
    loadCliente();
  }, [id]);

  const loadCliente = async () => {
    try {
      if (!id) return;
      const data = await clientesService.getById(Number(id));
      setCliente(data);
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: CreateClienteData) => {
    try {
        if (!cliente) return;
        const updated = await clientesService.update(cliente.id, data);
        setCliente(prev => prev ? { ...prev, ...updated } : updated);
        toast.success('Dados atualizados com sucesso!');
        setIsModalOpen(false);
    } catch (error) {
        toast.error('Erro ao atualizar cliente');
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;
  if (!cliente) return <div className="p-8 text-center text-red-500">Cliente não encontrado</div>;

  const tabs = [
    { id: 'geral', label: 'Geral', icon: User },
    { id: 'consumo', label: 'Consumo', icon:  DollarSign},
    { id: 'atividades', label: 'Atividades', icon: Clock },
    { id: 'galeria', label: 'Galeria de Fotos', icon: Image },
    { id: 'fichas', label: 'Fichas', icon: FileText },
    { id: 'pacotes', label: 'Pacotes', icon: Package },
    { id: 'saldo', label: 'Saldo', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
        </div>
        
        <div className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/clientes')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
               {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cliente.nome}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cliente.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cliente.status.toUpperCase()}
                 </span>
                 <span>• {cliente.telefone}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 relative">
             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-95 z-40"
             >
                <Plus className={`w-6 h-6 transition-transform ${isMenuOpen ? 'rotate-45' : ''}`} />
             </button>

             {isMenuOpen && (
                <>
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute top-14 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 w-56 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                    {[
                        { label: 'Novo Atendimento', icon: User, action: () => setIsNewAppointmentOpen(true) },
                        { label: 'Venda de Produto', icon: Package, action: () => toast('Venda de Produto em breve!') },
                        { label: 'Venda de Pacote', icon: DollarSign, action: () => toast('Venda de Pacote em breve!') },
                        { label: 'Adicionar Crédito', icon: CreditCard, action: () => toast('Adicionar Crédito em breve!') },
                    ].map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.action();
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-3 transition-colors text-sm"
                        >
                           {item.label}
                        </button>
                    ))}
                </div>
                </>
             )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
           <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Gasto</p>
              <p className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.stats?.totalGasto || 0)}
              </p>
           </div>
           <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Atendimentos</p>
              <p className="text-lg font-bold text-gray-900">{cliente.stats?.totalAtendimentos || 0}</p>
           </div>
           <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Pacotes</p>
              <p className="text-lg font-bold text-gray-900">{cliente.stats?.totalPacotes || 0}</p>
           </div>
           <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Última Visita</p>
              <p className="text-lg font-bold text-gray-900">
                 {cliente.stats?.ultimoAtendimento ? new Date(cliente.stats.ultimoAtendimento).toLocaleDateString('pt-BR') : '-'}
              </p>
           </div>
        </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
         {activeTab === 'geral' && (
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                   <h3 className="font-bold text-gray-900">Dados Cadastrais</h3>
                   <button 
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                   >
                      <Edit className="w-4 h-4" />
                      Editar Dados
                   </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{cliente.telefone}</div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{cliente.email || '-'}</div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{cliente.cpf || '-'}</div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Data Nascimento</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                       {cliente.dataNascimento ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR') : '-'}
                    </div>
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{cliente.endereco || '-'}</div>
                 </div>
               </div>
            </div>
         )}
         
         {activeTab === 'atividades' && (
           <div className="space-y-4">
              <h3 className="font-bold text-gray-900 mb-4">Histórico de Atividades</h3>
              {cliente.atividades && cliente.atividades.length > 0 ? (
                <div className="space-y-4">
                   {cliente.atividades.map((item: any) => (
                     <div key={`${item.tipo}-${item.id}`} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`p-3 rounded-full ${item.tipo === 'atendimento' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                           {item.tipo === 'atendimento' ? <Calendar className="w-5 h-5"/> : <DollarSign className="w-5 h-5"/>}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between">
                              <h4 className="font-bold text-gray-900">{item.descricao}</h4>
                              <span className="text-sm font-semibold text-gray-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                              </span>
                           </div>
                           <p className="text-sm text-gray-500 mt-1">
                              {new Date(item.data).toLocaleDateString('pt-BR')} às {new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} • Profissional: {item.profissional}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">Nenhuma atividade registrada.</div>
              )}
           </div>
         )}

         {['consumo', 'galeria', 'fichas', 'pacotes', 'saldo'].includes(activeTab) && (
             <div className="text-center py-20 text-gray-400">
                <div className="text-4xl mb-4">🚧</div>
                <p>A aba <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> está em desenvolvimento.</p>
             </div>
         )}
      </div>

      <ClienteForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        cliente={cliente}
      />

      <NovoAtendimentoModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        cliente={cliente}
        onSuccess={() => {
            loadCliente(); // Reload timeline
        }}
      />
    </div>
  );
};

export default ClientePerfil;

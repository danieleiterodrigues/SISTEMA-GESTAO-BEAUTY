import { useState, useEffect } from 'react';
import { X, Calendar, User, Scissors, Trash2, Plus, RefreshCw, ChevronDown, DollarSign, Clock, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import servicosService, { type Servico } from '../../services/servicosService';
import colaboradoresService, { type Colaborador } from '../../services/colaboradoresService';
import atendimentosService, { type CreateAtendimentoData } from '../../services/atendimentosService';
import { type Cliente } from '../../services/clientesService';

interface NovoAtendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onSuccess?: () => void;
}

interface AppointmentItem {
  tempId: string;
  service: Servico;
  professionalId: number | null;
  price: number;
  duration: number;
  discount: number;
}

const NovoAtendimentoModal = ({ isOpen, onClose, cliente, onSuccess }: NovoAtendimentoModalProps) => {
  const [loading, setLoading] = useState(false);
  
  // Data Sources
  const [availableServicos, setAvailableServicos] = useState<Servico[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  
  // Form State
  const [items, setItems] = useState<AppointmentItem[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('09:00');
  const [repeat, setRepeat] = useState(false);
  const [observation, setObservation] = useState('');

  // UI State
  const [showServiceGrid, setShowServiceGrid] = useState(true); // Always show grid initially or when adding

  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([
        servicosService.getAll(),
        colaboradoresService.getAll()
      ]);
      setAvailableServicos(s);
      setColaboradores(c);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };

  const resetForm = () => {
    setItems([]);
    setDate(new Date().toISOString().split('T')[0]);
    setTime('09:00');
    setRepeat(false);
    setObservation('');
    setShowServiceGrid(true);
  };

  const addItem = (service: Servico) => {
    const newItem: AppointmentItem = {
      tempId: Math.random().toString(36).substr(2, 9),
      service,
      // Default to null (Definir Depois) if no collaborators, or just always force user to choose/confirm.
      // Safer to default to first if available, but safeguard it.
      professionalId: colaboradores.length > 0 ? colaboradores[0].id : null,
      price: Number(service.valor), // Ensure number
      duration: service.duracaoMinutos,
      discount: 0
    };
    setItems([...items, newItem]);
    setShowServiceGrid(false); 
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter(i => i.tempId !== tempId));
    if (items.length <= 1) setShowServiceGrid(true);
  };

  const updateItem = (tempId: string, field: keyof AppointmentItem, value: any) => {
    setItems(items.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um serviço');
      return;
    }
    const invalidItem = items.find(i => i.price < 0);
    if (invalidItem) {
      toast.error(`Preço inválido para o serviço: ${invalidItem.service.nome}`);
      return;
    }

    setLoading(true);
    try {
      // In a real scenario, we might create multiple appointments or a single one with multiple items.
      // Keeping it simple: One appointment, services linked. 
      // NOTE: createdAtendimentoDto might need adjustment to support item-specific prices/professionals. 
      // For now, we'll take the first item's professional as main, or loop create?
      // Let's assume the backend expects a list of services. 
      // BUT current backend is Simple. We will just send the aggregations or create multiple?
      // Let's send the first professional as the main one for now, or the most common.
      
      const payload: CreateAtendimentoData = {
        clienteId: cliente.id,
        colaboradorId: items[0].professionalId!, // Main professional (or null)
        servicos: items.map(i => i.service.id),
        dataAtendimento: new Date(date).toISOString(),
        // Only send time if professional is selected (Schedule defined)
        horarioInicio: items[0].professionalId ? time : undefined, 
        observacoes: observation + (items.length > 1 ? ` (Multi-serviços)` : ''),
      };

      await atendimentosService.create(payload);
      toast.success('Agendamento realizado!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao agendar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, i) => acc + i.price, 0);
  const totalDiscount = items.reduce((acc, i) => acc + (Number(i.discount) || 0), 0);
  const total = Math.max(0, subtotal - totalDiscount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
               <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Novo Atendimento</h2>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Global Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Cliente</label>
                <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-purple-900 font-medium">
                   <User className="w-4 h-4" />
                   {cliente.nome}
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Data e Hora</label>
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                   </div>
                   <div className="relative w-28">
                      <input 
                        type="time" 
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                   </div>
                </div>
             </div>
          </div>

          <hr className="border-gray-100" />

          {/* Selected Items List */}
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={item.tempId} className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-bold text-gray-900">Serviço {index + 1}</span>
                   <button onClick={() => removeItem(item.tempId)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm hover:border-purple-200 transition-colors">
                   {/* Professional Select */}
                   <div>
                      <label className="text-xs text-gray-500 mb-1 block">Profissional</label>
                      <div className="relative">
                         <select 
                            value={item.professionalId === null ? 'later' : item.professionalId}
                            onChange={(e) => {
                                const val = e.target.value;
                                updateItem(item.tempId, 'professionalId', val === 'later' ? null : Number(val));
                            }}
                            className={`w-full p-2.5 border rounded-lg text-sm font-medium outline-none appearance-none ${
                                item.professionalId === null 
                                ? 'bg-orange-50 border-orange-200 text-orange-700' 
                                : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500'
                            }`}
                         >
                            <option value="later">📅 Definir Depois (Cronograma)</option>
                            <option disabled>──────</option>
                            {colaboradores.map(col => (
                               <option key={col.id} value={col.id}>{col.nome}</option>
                            ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                   </div>

                   {/* Service Name (Readonly) */}
                   <div>
                       <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                          <Scissors className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-sm">{item.service.nome}</span>
                       </div>
                   </div>

                   {/* Details Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="relative">
                         <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                         <input 
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.tempId, 'price', Number(e.target.value))}
                            className="w-full p-2 pl-7 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500"
                            placeholder="Preço"
                         />
                      </div>
                      <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400">%</span>
                          <input 
                            type="number" 
                            className="w-full p-2 pl-7 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500" 
                            placeholder="Desconto"
                            value={item.discount || ''}
                            onChange={(e) => updateItem(item.tempId, 'discount', Number(e.target.value))}
                          />
                      </div>
                      <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400"><Clock className="w-3.5 h-3.5"/></span>
                          <input 
                            type="number" 
                            className="w-full p-2 pl-8 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500"
                            value={item.duration}
                            onChange={(e) => updateItem(item.tempId, 'duration', Number(e.target.value))}
                          />
                      </div>
                   </div>
                   
                   <button className="text-xs text-pink-500 font-semibold hover:text-pink-600 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Adicionar Assistente
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Grid */}
          {showServiceGrid ? (
             <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                   <Percent className="w-4 h-4 text-purple-600" />
                   Catálogo de Serviços
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   {availableServicos.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => addItem(s)}
                        className="text-left p-3 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                      >
                         <div className="font-semibold text-gray-900 group-hover:text-purple-700 text-sm">{s.nome}</div>
                         <div className="text-xs text-gray-500 flex justify-between mt-1">
                            <span>{s.duracaoMinutos} min</span>
                            <span className="font-bold text-purple-600">R$ {s.valor}</span>
                         </div>
                      </button>
                   ))}
                </div>
             </div>
          ) : (
             <button 
                onClick={() => setShowServiceGrid(true)}
                className="w-full py-3 border-2 border-dashed border-purple-200 rounded-xl text-purple-600 font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
             >
                <Plus className="w-5 h-5" />
                ADICIONAR MAIS SERVIÇOS
             </button>
          )}

          {/* Observation & Repeat */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
              <textarea 
                  placeholder="Observação (opcional)"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
              />
              
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer" onClick={() => setRepeat(!repeat)}>
                    <RefreshCw className={`w-5 h-5 ${repeat ? 'text-pink-600' : 'text-gray-400'}`} />
                    <span className={repeat ? 'text-pink-600' : ''}>Repetir atendimento</span>
                 </div>
                 <div 
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${repeat ? 'bg-pink-500' : 'bg-gray-200'}`}
                    onClick={() => setRepeat(!repeat)}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${repeat ? 'translate-x-6' : ''}`}></div>
                 </div>
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
           </div>
           {totalDiscount > 0 && (
               <div className="flex justify-between items-center mb-4 text-sm text-green-600">
                  <span>Descontos</span>
                  <span>- R$ {totalDiscount.toFixed(2)}</span>
               </div>
           )}
           <div className="flex justify-between items-center mb-6 text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-purple-600">R$ {total.toFixed(2)}</span>
           </div>
           
           <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {loading ? 'Salvando...' : 'SALVAR'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default NovoAtendimentoModal;

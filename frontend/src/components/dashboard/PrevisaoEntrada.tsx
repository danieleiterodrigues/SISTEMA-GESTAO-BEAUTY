import React, { useState } from 'react';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { usePrevisaoEntrada } from '../../hooks/useDashboard';
import TabelaQuitacoes from './TabelaQuitacoes';

const PrevisaoEntrada: React.FC = () => {
  const [periodo, setPeriodo] = useState('7d');
  const [showAtrasados, setShowAtrasados] = useState(false);
  const { data, isLoading, isError } = usePrevisaoEntrada({ periodo });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (isLoading) {
    return <div className="p-6 bg-white rounded-xl shadow-sm h-64 flex items-center justify-center">Carregando previsão...</div>;
  }

  if (isError || !data) {
    return <div className="p-6 bg-white rounded-xl shadow-sm h-64 flex items-center justify-center text-status-error">Erro ao carregar dados.</div>;
  }

  const { servicos_sociais, pacotes, total } = data.resumo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900">Previsão de Entrada de Valores</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent cursor-pointer"
            >
              <option value="7d">Próximos 7 dias</option>
              <option value="15d">Próximos 15 dias</option>
              <option value="30d">Próximos 30 dias</option>
            </select>
            <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <button className="p-2 text-gray-500 hover:text-primary-pink hover:bg-primary-pink-light rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Alertas Section */}
      {data.alertas && (data.alertas.quitacoes_atrasadas > 0 || data.alertas.pacotes_vencendo > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.alertas.quitacoes_atrasadas > 0 && (
            <div 
              onClick={() => setShowAtrasados(true)}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-red-100 transition-colors"
            >
              <div className="p-2 bg-white rounded-full text-red-500">
                 <span className="font-bold text-lg">!</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-800">Pagamentos em Atraso</p>
                <p className="text-sm text-red-600">
                  {data.alertas.quitacoes_atrasadas} quitações vencidas (Total: {formatCurrency(data.alertas.valor_atrasado)})
                </p>
              </div>
              <span className="text-xs font-semibold text-red-700 underline">Ver Lista</span>
            </div>
          )}
          
          {data.alertas.pacotes_vencendo > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-orange-500">
                 <span className="font-bold text-lg">!</span>
              </div>
              <div>
                <p className="font-bold text-orange-800">Pacotes Vencendo</p>
                <p className="text-sm text-orange-600">
                  {data.alertas.pacotes_vencendo} pacotes precisam ser quitados esta semana 
                  (Total: {formatCurrency(data.alertas.valor_pacotes_vencendo)})
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Serviços Sociais */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-primary-pink relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-16 h-16 bg-primary-pink rounded-full blur-xl"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">SERVIÇOS SOCIAIS</p>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(servicos_sociais.valor_total)}</span>
            <span className="text-xs text-primary-pink font-medium mt-1">
              {servicos_sociais.quantidade} quitações a receber
            </span>
          </div>
        </div>

        {/* Card 2: Pacotes */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-secondary-blue-dark relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-16 h-16 bg-secondary-blue-dark rounded-full blur-xl"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">PACOTES (NOIVAS/DEBUTS)</p>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(pacotes.valor_total)}</span>
            <span className="text-xs text-secondary-blue-dark font-medium mt-1">
              {pacotes.quantidade} pacotes a quitar
            </span>
          </div>
        </div>

        {/* Card 3: Total */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-status-success relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-16 h-16 bg-status-success rounded-full blur-xl"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">TOTAL PREVISTO</p>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(total.valor_total)}</span>
            <span className="text-xs text-status-success font-medium mt-1">
              {total.quantidade} quitações no período
            </span>
          </div>
        </div>
      </div>

      <TabelaQuitacoes quitacoes={data.proximas_quitacoes} />

      {/* Modal de Atrasados */}
      {showAtrasados && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-red-700">Pagamentos em Atraso</h3>
               <button onClick={() => setShowAtrasados(false)} className="text-gray-400 hover:text-gray-600">✕</button>
             </div>
             
             <div className="overflow-y-auto p-0">
               {data.atrasados_detalhados && data.atrasados_detalhados.length > 0 ? (
                 <table className="w-full text-left text-sm">
                   <thead className="bg-red-50 text-red-800 font-semibold sticky top-0">
                      <tr>
                        <th className="px-6 py-4">Cliente / Tipo</th>
                        <th className="px-6 py-4">Vencimento</th>
                        <th className="px-6 py-4 text-right">Valor Pendente</th>
                        <th className="px-6 py-4 text-center">Ação</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {data.atrasados_detalhados.map((item) => (
                       <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{item.cliente_nome}</div>
                            <div className="text-xs text-gray-500">{item.descricao}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}
                            <span className="block text-xs text-red-500 font-medium whitespace-nowrap">Vencido</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-red-600">
                             {formatCurrency(item.saldo_pendente)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <a 
                              href={`/clientes?search=${encodeURIComponent(item.cliente_nome)}`}
                              target="_blank"
                              className="text-xs bg-white border border-gray-200 hover:border-purple-300 hover:text-purple-600 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Ver Cliente
                            </a>
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="p-8 text-center text-gray-500">Nenhum pagamento atrasado encontrado.</div>
               )}
             </div>
             
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button onClick={() => setShowAtrasados(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Fechar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrevisaoEntrada;

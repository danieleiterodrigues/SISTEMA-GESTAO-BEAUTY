import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProximaQuitacao {
  id: number;
  tipo: 'servico_social' | 'pacote';
  cliente_nome: string;
  descricao: string;
  data_quitacao: string;
  valor_total: number;
  valor_pago: number;
  saldo_pendente: number;
}

interface TabelaQuitacoesProps {
  quitacoes: ProximaQuitacao[];
}

const TabelaQuitacoes: React.FC<TabelaQuitacoesProps> = ({ quitacoes }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Próximas Quitações</h4>
      </div>
      <div className="divide-y divide-gray-100">
        {quitacoes.map((item) => {
           const isSocial = item.tipo === 'servico_social';
           // Pink for Social, Blue for Pacote
           const barColor = isSocial ? 'bg-primary-pink' : 'bg-secondary-blue-dark';

           return (
             <div key={`${item.tipo}-${item.id}`} className="group p-4 flex items-center justify-between hover:bg-gray-50 transition-colors relative">
               {/* Left colored bar */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} />
               
               <div className="pl-3 flex flex-col">
                 <Link 
                   to={`/clientes?search=${encodeURIComponent(item.cliente_nome)}`}
                   className="text-sm font-semibold text-gray-900 hover:text-primary-pink hover:underline"
                 >
                    {item.cliente_nome}
                 </Link>
                 <span className="text-xs text-gray-500 capitalize">{item.tipo.replace('_', ' ')}</span>
               </div>

               <div className="flex flex-col text-right sm:text-left sm:ml-4 sm:flex-1 sm:items-start">
                   <span className="text-xs text-gray-500">
                     {format(new Date(item.data_quitacao), "dd 'de' MMM", { locale: ptBR })}
                   </span>
                   <span className="text-xs text-gray-400">{item.descricao}</span>
               </div>

               <div className="flex flex-col items-end">
                 <span className="text-sm font-bold text-gray-900">{formatCurrency(item.saldo_pendente)}</span>
                 <span className="text-xs text-gray-400"> de {formatCurrency(item.valor_total)}</span>
               </div>
             </div>
           );
        })}
        {quitacoes.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            Nenhuma quitação prevista para este período.
          </div>
        )}
      </div>
    </div>
  );
};

export default TabelaQuitacoes;

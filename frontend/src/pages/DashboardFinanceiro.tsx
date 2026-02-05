import React from 'react';
import { TrendingUp, ArrowDownRight, Users, Calendar } from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import PrevisaoEntrada from '../components/dashboard/PrevisaoEntrada';
import { useDashboardFinanceiro } from '../hooks/useDashboard';

const DashboardFinanceiro: React.FC = () => {
  const { data: financeiroData } = useDashboardFinanceiro();

  // Mock data for top metrics if backend not ready or for visual testing
  const metrics = [
    {
      title: 'Faturamento Bruto',
      value: financeiroData?.faturamento ?? 42850.00,
      format: 'currency' as const,
      percentageChange: 12.5,
      trend: 'up' as const,
      icon: TrendingUp,
      iconColor: '#10B981',
      iconBgColor: '#ECFDF5'
    },
    {
      title: 'Despesas Pagas',
      value: financeiroData?.despesas ?? 15200.00,
      format: 'currency' as const,
      percentageChange: -3.2,
      trend: 'down' as const,
      icon: ArrowDownRight,
      iconColor: '#EF4444',
      iconBgColor: '#FEE2E2'
    },
    {
      title: 'Novos Clientes',
      value: financeiroData?.novosClientes ?? 128,
      format: 'number' as const,
      percentageChange: 4.2,
      trend: 'up' as const,
      icon: Users,
      iconColor: '#3B82F6',
      iconBgColor: '#DBEAFE'
    },
    {
      title: 'Atendimentos Mês',
      value: financeiroData?.atendimentos ?? 452,
      format: 'number' as const,
      percentageChange: 8.4,
      trend: 'up' as const,
      icon: Calendar,
      iconColor: '#10B981',
      iconBgColor: '#ECFDF5'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do desempenho financeiro e operacional.</p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Section: Previsão de Entrada (2/3) + Placeholder for Popular Services (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PrevisaoEntrada />
        </div>
        
        {/* Placeholder for Services Popular / Others as per design (optional in this task scope but good for layout) */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm h-full border border-gray-100 flex flex-col items-center justify-center text-gray-400 text-sm text-center">
             <p>Gráfico de Serviços Populares</p>
             <p className="text-xs mt-2">(Em desenvolvimento)</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;

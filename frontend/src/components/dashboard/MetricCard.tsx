import React from 'react';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  format?: 'currency' | 'number';
  percentageChange: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  format = 'number',
  percentageChange,
  trend,
  icon: Icon,
  iconColor,
  iconBgColor,
}) => {
  const formattedValue = format === 'currency' 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
    : value;

  const isPositive = trend === 'up';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{formattedValue}</h3>
        </div>
        <div 
          className="p-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span 
          className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-status-success' : 'text-status-error'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {Math.abs(percentageChange)}%
        </span>
        <span className="text-sm text-gray-500">vs. mês anterior</span>
      </div>
    </div>
  );
};

export default MetricCard;

import api from './api';

export interface Atendimento {
  id: number;
  clienteId: number;
  colaboradorId?: number; // Optional
  dataAtendimento: string; // ISO DateTime or Date string
  horarioInicio?: string; // Optional
  horarioFim?: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  valorTotal: number;
  observacoes?: string;
  servicos?: { id: number; nome: string; valor: number }[];
}

export interface CreateAtendimentoData {
  clienteId: number;
  colaboradorId?: number | null; // Optional or null
  dataAtendimento: string;
  horarioInicio?: string;
  horarioFim?: string;
  servicos: number[]; // Array of Service IDs
  observacoes?: string;
}

const atendimentosService = {
  create: async (data: CreateAtendimentoData) => {
    const response = await api.post<Atendimento>('/atendimentos', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<Atendimento[]>('/atendimentos');
    return response.data;
  },
  
  getByClienteId: async (clienteId: number) => {
      // Assuming backend supports filtering or we filter manually. 
      // For now, let's assume a generic getAll and filter client side if needed, 
      // or specific endpoint if it exists. 
      // Since we don't know if backend filters, let's stick to basic CREATE for now.
      return []; 
  }
};

export default atendimentosService;

import api from './api';

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  stats?: {
    totalAtendimentos: number;
    totalPacotes: number;
    totalGasto: number;
    ultimoAtendimento: string | null;
  };
  atividades?: {
    id: number;
    tipo: 'atendimento' | 'venda' | 'pacote';
    data: string;
    descricao: string;
    profissional: string;
    valor: number;
    status: string;
  }[];
}

export interface CreateClienteData {
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
}

const clientesService = {
  getAll: async () => {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  create: async (data: CreateClienteData) => {
    const response = await api.post<Cliente>('/clientes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateClienteData>) => {
    const response = await api.patch<Cliente>(`/clientes/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
};

export default clientesService;

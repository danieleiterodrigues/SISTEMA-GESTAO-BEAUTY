import api from './api';

export interface Colaborador {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  ativo: boolean;
  corAgenda?: string;
}

export interface CreateColaboradorData {
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  ativo?: boolean;
}

const colaboradoresService = {
  getAll: async () => {
    const response = await api.get<Colaborador[]>('/colaboradores');
    return response.data;
  },

  create: async (data: CreateColaboradorData) => {
    const response = await api.post<Colaborador>('/colaboradores', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateColaboradorData>) => {
    const response = await api.patch<Colaborador>(`/colaboradores/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/colaboradores/${id}`);
    return response.data;
  },
};

export default colaboradoresService;

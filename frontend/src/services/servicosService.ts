import api from './api';

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  duracaoMinutos: number;
  valor: number;
  comissaoTipo: 'percentual' | 'fixo';
  comissaoValor: number;
  ativo: boolean;
}

export interface CreateServicoData {
  nome: string;
  descricao?: string;
  categoria?: string;
  duracaoMinutos: number;
  valor: number;
  comissaoTipo: 'percentual' | 'fixo';
  comissaoValor: number;
  ativo?: boolean;
}

const servicosService = {
  getAll: async () => {
    const response = await api.get<Servico[]>('/servicos');
    return response.data;
  },

  create: async (data: CreateServicoData) => {
    const response = await api.post<Servico>('/servicos', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateServicoData>) => {
    const response = await api.patch<Servico>(`/servicos/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/servicos/${id}`);
    return response.data;
  },
};

export default servicosService;

import api from './api';

import type { PrevisaoEntradaResponse } from '../types/dashboard.types';

export interface PrevisaoEntradaParams {
  periodo: string;
  dataInicio?: string;
  dataFim?: string;
}

export const dashboardService = {
  getFinanceiro: async () => {
    const response = await api.get('/dashboard/financeiro');
    return response.data;
  },

  getPrevisaoEntrada: async (params: PrevisaoEntradaParams): Promise<PrevisaoEntradaResponse> => {
    const response = await api.get<PrevisaoEntradaResponse>('/dashboard/previsao-entrada', { params });
    return response.data;
  },

  exportPDF: async () => {
    const response = await api.get('/dashboard/financeiro/export-pdf', {
      responseType: 'blob'
    });
    return response.data;
  }
};

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import type { PrevisaoEntradaParams } from '../services/dashboard.service';
import type { PrevisaoEntradaResponse } from '../types/dashboard.types';

export function useDashboardFinanceiro() {
  return useQuery({
    queryKey: ['dashboard', 'financeiro'],
    queryFn: () => dashboardService.getFinanceiro(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5,
  });
}

export function usePrevisaoEntrada(params: PrevisaoEntradaParams) {
  return useQuery<PrevisaoEntradaResponse>({
    queryKey: ['previsao-entrada', params],
    queryFn: () => dashboardService.getPrevisaoEntrada(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

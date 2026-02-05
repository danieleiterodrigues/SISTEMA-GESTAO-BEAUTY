export interface DashboardResumo {
  servicos_sociais: {
    valor_total: number;
    quantidade: number;
  };
  pacotes: {
    valor_total: number;
    quantidade: number;
  };
  total: {
    valor_total: number;
    quantidade: number;
  };
}

export interface ProximaQuitacao {
  id: number;
  tipo: 'servico_social' | 'pacote';
  cliente_nome: string;
  pacote_nome?: string;
  descricao: string;
  data_evento?: string;
  prazo_quitacao?: string;
  data_quitacao: string;
  valor_total: number;
  valor_pago: number;
  saldo_pendente: number;
}

export interface DashboardAlertas {
  quitacoes_atrasadas: number;
  valor_atrasado: number;
  pacotes_vencendo: number;
  valor_pacotes_vencendo: number;
}


export interface AtrasadoDetalhado {
    id: number;
    tipo: 'servico_social' | 'pacote';
    cliente_nome: string;
    descricao: string;
    data_vencimento: string;
    valor_total: number;
    valor_pago: number;
    saldo_pendente: number;
}

export interface PrevisaoEntradaResponse {
  periodo: string;
  data_inicio: string;
  data_fim: string;
  resumo: DashboardResumo;
  proximas_quitacoes: ProximaQuitacao[];
  atrasados_detalhados?: AtrasadoDetalhado[];
  alertas: DashboardAlertas;
}

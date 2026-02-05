export class PrevisaoQuitacaoDto {
  id: number;
  tipo: string;
  cliente_nome: string;
  descricao: string;
  data_quitacao: Date;
  valor_total: number;
  valor_pago: number;
  saldo_pendente: number;
}

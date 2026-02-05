
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetPrevisaoEntradaDto } from './dto/get-previsao-entrada.dto';
import { TipoAtendimento, StatusPacoteVenda, StatusAtendimento } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async getPrevisaoEntrada(query: GetPrevisaoEntradaDto) {
    try {
      const { periodo = '7d', dataInicio, dataFim } = query;

      let startDate: Date;
      let endDate: Date;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (periodo === 'personalizado' && dataInicio && dataFim) {
        startDate = new Date(dataInicio);
        endDate = new Date(dataFim);
      } else {
        let days = 7;
        if (periodo === '15d') days = 15;
        if (periodo === '30d') days = 30;

        startDate = today;
        endDate = this.addDays(today, days);
      }

      // Log para debug
      console.log(`[Dashboard] Consultando previsão: ${this.formatDate(startDate)} até ${this.formatDate(endDate)}`);

      const eventStartDate = this.addDays(startDate, 10);
      const eventEndDate = this.addDays(endDate, 10);

      // 1. Serviços Sociais
      const servicosSociais = await this.prisma.atendimento.findMany({
        where: {
          tipo: TipoAtendimento.servico_social,
          dataAtendimento: {
            gte: startDate,
            lte: endDate,
          },
          status: { in: [StatusAtendimento.agendado, StatusAtendimento.em_atendimento, StatusAtendimento.concluido] },
        },
        include: {
          cliente: true,
        },
      });

      const servicosSociaisFiltered = servicosSociais.filter(
        (a) => Number(a.valorTotal) > Number(a.valorPago),
      );

      const servicosSociaisData = servicosSociaisFiltered.map((atend) => ({
        id: atend.id,
        tipo: 'servico_social' as const,
        cliente_nome: atend.cliente.nome,
        descricao: 'Serviço Social',
        data_quitacao: this.formatDate(atend.dataAtendimento),
        valor_total: Number(atend.valorTotal),
        valor_pago: Number(atend.valorPago),
        saldo_pendente: Number(atend.valorTotal) - Number(atend.valorPago),
      }));

      // 2. Pacotes
      const pacotes = await this.prisma.pacoteVenda.findMany({
        where: {
          dataEvento: {
            gte: eventStartDate,
            lte: eventEndDate,
          },
          status: StatusPacoteVenda.ativo,
        },
        include: {
          cliente: true,
          pacote: true,
        },
      });

      // Log pacotes encontrados
      console.log(`[Dashboard] Pacotes encontrados no range de evento ${this.formatDate(eventStartDate)} - ${this.formatDate(eventEndDate)}: ${pacotes.length}`);

      const pacotesFiltered = pacotes.filter(
        (p) => Number(p.valorTotal) > Number(p.valorPago),
      );

      const pacotesData = pacotesFiltered.map((pv) => ({
        id: pv.id,
        tipo: 'pacote' as const,
        cliente_nome: pv.cliente.nome,
        pacote_nome: pv.pacote.nome,
        descricao: `Pacote ${pv.pacote.nome}`,
        data_evento: this.formatDate(pv.dataEvento),
        prazo_quitacao: this.formatDate(this.addDays(pv.dataEvento, -10)),
        data_quitacao: this.formatDate(this.addDays(pv.dataEvento, -10)),
        valor_total: Number(pv.valorTotal),
        valor_pago: Number(pv.valorPago),
        saldo_pendente: Number(pv.valorTotal) - Number(pv.valorPago),
      }));

      // Totals
      const totalServicos = servicosSociaisData.reduce((acc, curr) => acc + curr.saldo_pendente, 0);
      const totalPacotes = pacotesData.reduce((acc, curr) => acc + curr.saldo_pendente, 0);

      const proximasQuitacoes = [...servicosSociaisData, ...pacotesData]
        .sort((a, b) => a.data_quitacao.localeCompare(b.data_quitacao));

      // Atrasados Detalhado
      const atrasadosSocialRaw = await this.getAtrasadosSocial(today);
      const atrasadosPacotesRaw = await this.getAtrasadosPacotes(today);

      const atrasadosSocial = atrasadosSocialRaw.map(a => ({
          id: a.id,
          tipo: 'servico_social',
          cliente_nome: a.cliente.nome,
          descricao: 'Serviço Social (Atrasado)',
          data_vencimento: this.formatDate(a.dataAtendimento),
          valor_total: Number(a.valorTotal),
          valor_pago: Number(a.valorPago),
          saldo_pendente: Number(a.valorTotal) - Number(a.valorPago)
      }));

      const atrasadosPacotes = atrasadosPacotesRaw.map(p => ({
          id: p.id,
          tipo: 'pacote',
          cliente_nome: p.cliente.nome,
          descricao: `Pacote ${p.pacote.nome} (Vencido)`,
          data_vencimento: this.formatDate(this.addDays(p.dataEvento, -10)),
          valor_total: Number(p.valorTotal),
          valor_pago: Number(p.valorPago),
          saldo_pendente: Number(p.valorTotal) - Number(p.valorPago)
      }));

      const listaAtrasados = [...atrasadosSocial, ...atrasadosPacotes]
        .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));

      return {
        periodo: periodo,
        data_inicio: this.formatDate(startDate),
        data_fim: this.formatDate(endDate),
        resumo: {
          servicos_sociais: {
            valor_total: totalServicos,
            quantidade: servicosSociaisData.length,
          },
          pacotes: {
            valor_total: totalPacotes,
            quantidade: pacotesData.length,
          },
          total: {
            valor_total: totalServicos + totalPacotes,
            quantidade: servicosSociaisData.length + pacotesData.length,
          },
        },
        proximas_quitacoes: proximasQuitacoes,
        atrasados_detalhados: listaAtrasados, // Nova lista
        alertas: {
            quitacoes_atrasadas: listaAtrasados.length,
            valor_atrasado: listaAtrasados.reduce((acc, curr) => acc + curr.saldo_pendente, 0),
            pacotes_vencendo: await this.calculatePacotesVencendo(today),
            valor_pacotes_vencendo: await this.calculateValorPacotesVencendo(today)
        }
      };
    } catch (error) {
      console.error('[DashboardService] Erro ao buscar previsão:', error);
      throw error;
    }
  }

  private async calculateQuitacoesAtrasadas(today: Date): Promise<number> {
    const social = await this.getAtrasadosSocial(today);
    const pacotes = await this.getAtrasadosPacotes(today);
    return social.length + pacotes.length;
  }

  private async calculateValorAtrasado(today: Date): Promise<number> {
    const social = await this.getAtrasadosSocial(today);
    const pacotes = await this.getAtrasadosPacotes(today);
    
    const socialTotal = social.reduce((acc, curr) => acc + (Number(curr.valorTotal) - Number(curr.valorPago)), 0);
    const pacotesTotal = pacotes.reduce((acc, curr) => acc + (Number(curr.valorTotal) - Number(curr.valorPago)), 0);
    
    return socialTotal + pacotesTotal;
  }

  private async calculatePacotesVencendo(today: Date): Promise<number> {
    const pacotes = await this.getPacotesVencendo(today);
    return pacotes.length;
  }

  private async calculateValorPacotesVencendo(today: Date): Promise<number> {
    const pacotes = await this.getPacotesVencendo(today);
    return pacotes.reduce((acc, curr) => acc + (Number(curr.valorTotal) - Number(curr.valorPago)), 0);
  }

  private async getAtrasadosSocial(today: Date) {
    const atendimentos = await this.prisma.atendimento.findMany({
      where: {
        tipo: TipoAtendimento.servico_social,
        dataAtendimento: { lt: today },
        status: { in: [StatusAtendimento.agendado, StatusAtendimento.em_atendimento, StatusAtendimento.concluido] },
      },
      include: { cliente: true }
    });
    return atendimentos.filter(a => Number(a.valorTotal) > Number(a.valorPago));
  }

  private async getAtrasadosPacotes(today: Date) {
    // Deadline < today => event - 10 < today
    const limitDate = this.addDays(today, 10);
    const pacotes = await this.prisma.pacoteVenda.findMany({
      where: {
        dataEvento: { lt: limitDate },
        status: StatusPacoteVenda.ativo,
      },
      include: { cliente: true, pacote: true }
    });
    return pacotes.filter(p => Number(p.valorTotal) > Number(p.valorPago));
  }

  private async getPacotesVencendo(today: Date) {
    // Deadline within next 5 days
    // today <= deadline <= today + 5
    // deadline = dataEvento - 10
    // today <= dataEvento - 10 <= today + 5
    // today + 10 <= dataEvento <= today + 15
    const start = this.addDays(today, 10);
    const end = this.addDays(today, 15);
    
    const pacotes = await this.prisma.pacoteVenda.findMany({
      where: {
        dataEvento: {
          gte: start,
          lte: end,
        },
        status: StatusPacoteVenda.ativo,
      },
    });
    return pacotes.filter(p => Number(p.valorTotal) > Number(p.valorPago));
  }

  async getFinanceiro() {
    // Implementação básica para evitar falha 404 e fornecer dados para os cards
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Faturamento: Soma de valorPago em pagamentos recebidos este mês
    // Simplificado para Vendas + Atendimentos
    const vendas = await this.prisma.venda.aggregate({
      _sum: { valorFinal: true },
      where: {
        dataVenda: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        statusPagamento: { in: ['pago', 'parcial'] } // Ajustar conforme enum real se necessário
      }
    });

    // Despesas
    const despesas = await this.prisma.despesa.aggregate({
      _sum: { valor: true },
        where: {
        dataPagamento: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        status: 'pago'
      }
    });

    // Novos Clientes
    const novosClientes = await this.prisma.cliente.count({
      where: {
        createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth }
      }
    });

    // Atendimentos
    const atendimentos = await this.prisma.atendimento.count({
      where: {
        dataAtendimento: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        status: 'concluido'
      }
    });

    return {
      faturamento: Number(vendas._sum.valorFinal) || 0,
      despesas: Number(despesas._sum.valor) || 0,
      novosClientes,
      atendimentos
    };
  }
}

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto';
import { UpdateAtendimentoDto } from './dto/update-atendimento.dto';
import { StatusAtendimento, TipoAtendimento } from '@prisma/client';

@Injectable()
export class AtendimentosService {
  constructor(private readonly prisma: PrismaService) {}

  private parseTime(timeString: string, baseDate: string): Date {
    return new Date(`${baseDate}T${timeString}:00`);
  }

  async create(createAtendimentoDto: CreateAtendimentoDto) {
    const { 
      clienteId, 
      colaboradorId, 
      dataAtendimento, 
      horarioInicio, 
      horarioFim, 
      observacoes, 
      servicos, 
      status,
      tipo,
      valorTotal,
      valorPago
    } = createAtendimentoDto;

    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const colaborador = await this.prisma.colaborador.findUnique({ where: { id: colaboradorId } });
    if (!colaborador) throw new NotFoundException('Colaborador não encontrado');

    const dateAtendimento = new Date(dataAtendimento);
    const timeInicio = this.parseTime(horarioInicio, dataAtendimento);
    let timeFim = horarioFim ? this.parseTime(horarioFim, dataAtendimento) : null;

    if (!servicos || servicos.length === 0) {
      throw new BadRequestException('Pelo menos um serviço deve ser selecionado');
    }

    const servicesData = await this.prisma.servico.findMany({
      where: { id: { in: servicos } },
    });

    if (servicesData.length !== servicos.length) {
      throw new BadRequestException('Um ou mais serviços não foram encontrados');
    }

    // Auto-calculate logic
    if (!timeFim) {
        const totalMinutes = servicesData.reduce((acc, curr) => acc + curr.duracaoMinutos, 0);
        timeFim = new Date(timeInicio.getTime() + totalMinutes * 60000);
    }
    
    // Auto-calculate valorTotal if not provided
    let calculatedTotal = 0;
    if (valorTotal === undefined || valorTotal === null) {
        calculatedTotal = servicesData.reduce((acc, curr) => acc + Number(curr.valor), 0);
    } else {
        calculatedTotal = valorTotal; 
    }

    try {
      const atendimento = await this.prisma.$transaction(async (prisma) => {
        const created = await prisma.atendimento.create({
          data: {
            clienteId,
            colaboradorId,
            tipo: tipo || TipoAtendimento.atendimento_comum,
            dataAtendimento: dateAtendimento,
            horarioInicio: timeInicio,
            horarioFim: timeFim,
            status: status || StatusAtendimento.agendado,
            valorTotal: calculatedTotal,
            valorPago: valorPago || 0,
            observacoes,
          },
        });

        const atendimentoServicosPromises = servicesData.map((servico) => {
            return prisma.atendimentoServico.create({
                data: {
                    atendimentoId: created.id,
                    servicoId: servico.id,
                    quantidade: 1, 
                    valorUnitario: servico.valor,
                    desconto: 0,
                }
            });
        });

        await Promise.all(atendimentoServicosPromises);

        return created;
      });

      return this.findOne(atendimento.id);

    } catch (error) {
      if (error.message && error.message.includes('Conflito de horário')) {
         throw new ConflictException('Conflito de horário: colaborador já possui atendimento neste período');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.atendimento.findMany({
      include: {
        cliente: true,
        colaborador: true,
        servicos: {
            include: {
                servico: true
            }
        }
      },
      orderBy: { dataAtendimento: 'desc' },
      take: 100,
    });
  }

  async findOne(id: number) {
    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id },
      include: {
        cliente: true,
        colaborador: true,
        servicos: {
            include: {
                servico: true
            }
        },
        vendas: true,
      },
    });

    if (!atendimento) {
      throw new NotFoundException(`Atendimento com ID ${id} não encontrado`);
    }

    return atendimento;
  }

  async update(id: number, updateAtendimentoDto: UpdateAtendimentoDto) {
      const { dataAtendimento, horarioInicio, horarioFim, servicos, ...rest } = updateAtendimentoDto;
      // Basic update implementation
      return this.prisma.atendimento.update({
          where: { id },
          data: rest
      });
  }

  async remove(id: number) {
    return this.prisma.atendimento.update({
        where: { id },
        data: { status: StatusAtendimento.cancelado },
    });
  }
}

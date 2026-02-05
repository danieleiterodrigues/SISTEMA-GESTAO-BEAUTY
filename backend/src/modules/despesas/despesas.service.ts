import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';

@Injectable()
export class DespesasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDespesaDto: CreateDespesaDto) {
    const { dataVencimento, dataPagamento, ...rest } = createDespesaDto;
    
    return this.prisma.despesa.create({
      data: {
        ...rest,
        dataVencimento: new Date(dataVencimento),
        dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
      },
    });
  }

  findAll() {
    return this.prisma.despesa.findMany({
      orderBy: { dataVencimento: 'desc' },
    });
  }

  async findOne(id: number) {
    const despesa = await this.prisma.despesa.findUnique({
      where: { id },
    });

    if (!despesa) {
      throw new NotFoundException(`Despesa com ID ${id} não encontrada`);
    }

    return despesa;
  }

  async update(id: number, updateDespesaDto: UpdateDespesaDto) {
    const { dataVencimento, dataPagamento, ...rest } = updateDespesaDto;

    const data: any = { ...rest };
    if (dataVencimento) data.dataVencimento = new Date(dataVencimento);
    if (dataPagamento) data.dataPagamento = new Date(dataPagamento);
    if (dataPagamento === null) data.dataPagamento = null;

    try {
      return await this.prisma.despesa.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Despesa com ID ${id} não encontrada`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
        // Physical Delete for now, or status Cancelado? Schema has status Cancelado.
        // Let's set status to cancelado.
      return await this.prisma.despesa.update({
        where: { id },
        data: { status: 'cancelado' },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Despesa com ID ${id} não encontrada`);
      }
      throw error;
    }
  }
}

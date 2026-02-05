import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePacoteVendaDto } from './dto/create-pacote-venda.dto';
import { UpdatePacoteVendaDto } from './dto/update-pacote-venda.dto';

@Injectable()
export class PacoteVendasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePacoteVendaDto) {
    // Validate existence
    const cliente = await this.prisma.cliente.findUnique({ where: { id: createDto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const pacote = await this.prisma.pacote.findUnique({ where: { id: createDto.pacoteId } });
    if (!pacote) throw new NotFoundException('Pacote não encontrado');

    return this.prisma.pacoteVenda.create({
      data: {
        clienteId: createDto.clienteId,
        pacoteId: createDto.pacoteId,
        dataVenda: new Date(createDto.dataVenda),
        dataEvento: new Date(createDto.dataEvento),
        valorTotal: createDto.valorTotal,
        valorPago: createDto.valorPago,
        status: createDto.status || 'ativo',
        observacoes: createDto.observacoes,
      },
    });
  }

  findAll() {
    return this.prisma.pacoteVenda.findMany({
      include: {
        cliente: true,
        pacote: true
      },
      orderBy: { dataEvento: 'asc' }
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.pacoteVenda.findUnique({
      where: { id },
      include: {
        cliente: true,
        pacote: true
      }
    });

    if (!record) throw new NotFoundException(`Venda de Pacote ${id} não encontrada`);
    return record;
  }

  async update(id: number, updateDto: UpdatePacoteVendaDto) {
    const { dataVenda, dataEvento, ...rest } = updateDto;
    const data: any = { ...rest };
    
    if (dataVenda) data.dataVenda = new Date(dataVenda);
    if (dataEvento) data.dataEvento = new Date(dataEvento);

    try {
        return await this.prisma.pacoteVenda.update({
            where: { id },
            data
        });
    } catch (error) {
        if (error.code === 'P2025') throw new NotFoundException(`Registro ${id} não encontrado`);
        throw error;
    }
  }

  async remove(id: number) {
    try {
        return await this.prisma.pacoteVenda.delete({ where: { id } });
    } catch (error) {
        if (error.code === 'P2025') throw new NotFoundException(`Registro ${id} não encontrado`);
        throw error;
    }
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    // Check CPF uniqueness if provided
    if (createClienteDto.cpf) {
      const existing = await this.prisma.cliente.findUnique({
        where: { cpf: createClienteDto.cpf },
      });
      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Convert dataNascimento string to Date if provided
    let dataNascimento: Date | undefined;
    if (createClienteDto.dataNascimento) {
        dataNascimento = new Date(createClienteDto.dataNascimento);
    }

    const { dataNascimento: _, ...rest } = createClienteDto;

    return this.prisma.cliente.create({
      data: {
        ...rest,
        dataNascimento,
      },
    });
  }

  findAll() {
    return this.prisma.cliente.findMany({
      where: { status: 'ativo' },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        atendimentos: {
          orderBy: { dataAtendimento: 'desc' },
          include: { 
            servicos: { include: { servico: true } }, 
            colaborador: true 
          }
        },
        vendas: {
          orderBy: { dataVenda: 'desc' }
        },
        pacotesComprados: {
          orderBy: { dataVenda: 'desc' },
          include: { pacote: true }
        }
      }
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Calculate Totals
    const totalAtendimentos = cliente.atendimentos.length;
    const totalPacotes = cliente.pacotesComprados.length;
    
    // Calculate Total Spent (Services + Sales + Packages)
    const totalGastoAtendimentos = cliente.atendimentos.reduce((acc, curr) => acc + Number(curr.valorTotal), 0);
    const totalGastoVendas = cliente.vendas.reduce((acc, curr) => acc + Number(curr.valorTotal), 0);
    const totalGastoPacotes = cliente.pacotesComprados.reduce((acc, curr) => acc + Number(curr.valorTotal), 0);
    const totalGasto = totalGastoAtendimentos + totalGastoVendas + totalGastoPacotes;

    const ultimoAtendimento = cliente.atendimentos.length > 0 ? cliente.atendimentos[0].dataAtendimento : null;

    // Combine History (Activities)
    const atividades = [
        ...cliente.atendimentos.map(a => ({
            id: a.id,
            tipo: 'atendimento',
            data: a.dataAtendimento,
            descricao: a.servicos.map(s => s.servico?.nome).join(', ') || 'Serviço',
            profissional: a.colaborador?.nome || 'N/A',
            valor: Number(a.valorTotal),
            status: a.status
        })),
        ...cliente.vendas.map(v => ({
            id: v.id,
            tipo: 'venda',
            data: v.dataVenda,
            descricao: 'Venda de Produtos', // Static as no items yet
            profissional: 'Loja',
            valor: Number(v.valorTotal),
            status: 'concluido'
        })),
        ...cliente.pacotesComprados.map(p => ({
            id: p.id,
            tipo: 'pacote',
            data: p.dataVenda,
            descricao: `Compra de Pacote: ${p.pacote?.nome}`,
            profissional: 'N/A',
            valor: Number(p.valorTotal),
            status: p.status
        }))
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return {
      ...cliente,
      stats: {
        totalAtendimentos,
        totalPacotes,
        totalGasto,
        ultimoAtendimento
      },
      atividades
    };
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    // Check CPF uniqueness if changing
    if (updateClienteDto.cpf) {
      const existing = await this.prisma.cliente.findUnique({
        where: { cpf: updateClienteDto.cpf },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    let dataNascimento: Date | null | undefined;
    if (updateClienteDto.dataNascimento) {
        dataNascimento = new Date(updateClienteDto.dataNascimento);
    } else if (updateClienteDto.dataNascimento === null) {
        dataNascimento = null; // Allow clearing
    }

    const { dataNascimento: _, ...rest } = updateClienteDto;
    
    // Prepare data object conditionally
    const data: any = { ...rest };
    if (dataNascimento !== undefined) {
        data.dataNascimento = dataNascimento;
    }

    try {
      return await this.prisma.cliente.update({
        where: { id },
        data,
      });
    } catch (error) {
       if (error.code === 'P2025') {
        throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Soft delete? Schema has status. Let's set status to inactive or actually delete?
      // Usually keeping data is better. Let's set status = 'inativo' if we want soft delete logic,
      // but standard Prisma remove usually deletes.
      // Re-reading PRD or Schema: Schema has StatusCliente enum (ativo, inativo).
      // Let's implement Soft Delete by setting status to inativo.
      
      return await this.prisma.cliente.update({
        where: { id },
        data: { status: 'inativo' },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
      }
      throw error;
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServicoDto: CreateServicoDto) {
    const { categoria, categoriaId, ...rest } = createServicoDto;
    
    // Se categoriaId for fornecido, usamos ele.
    // Ignoramos o campo 'categoria' string legado do DTO se não for usado para nada.
    // O Prisma espera 'categoria: { connect: { id: ... } }' se usarmos relations, ou 'categoriaId' escalar se usarmos UncheckedInput.
    // Vamos usar o dados como estão, mas precisamos limpar o objeto para nao passar propriedades extras (como 'categoria' string se existir no DTO e nao no model).

    const data: any = {
      ...rest,
    };

    if (categoriaId) {
      data.categoria = { connect: { id: categoriaId } };
    }

    return this.prisma.servico.create({
      data,
    });
  }

  findAll() {
    return this.prisma.servico.findMany({
      where: {
        ativo: true, // Only active services by default
      },
      orderBy: {
        nome: 'asc',
      },
      include: {
        categoria: true,
      },
    });
  }

  async findOne(id: number) {
    const servico = await this.prisma.servico.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });

    if (!servico) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    return servico;
  }

  async update(id: number, updateServicoDto: UpdateServicoDto) {
    const { categoria, categoriaId, ...rest } = updateServicoDto;
    
    const data: any = {
        ...rest
    };

    if (categoriaId) {
        data.categoria = { connect: { id: categoriaId } };
    }

    try {
      return await this.prisma.servico.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Soft delete
    return this.prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

@Injectable()
export class ColaboradoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createColaboradorDto: CreateColaboradorDto) {
    // Check CPF uniqueness
    if (createColaboradorDto.cpf) {
      const existing = await this.prisma.colaborador.findUnique({
        where: { cpf: createColaboradorDto.cpf },
      });
      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Check Email uniqueness (optional but good)
    if (createColaboradorDto.email) {
      // Prisma doesn't have unique constraint on email for Colaborador in schema shown?
      // Wait, schema check: email String? @db.VarChar(100). No unique constraint.
      // But Usuario has unique email.
      // Let's just trust schema.
    }

    // Convert dataAdmissao
    let dataAdmissao: Date | undefined;
    if (createColaboradorDto.dataAdmissao) {
      dataAdmissao = new Date(createColaboradorDto.dataAdmissao);
    }

    const { dataAdmissao: _, ...rest } = createColaboradorDto;

    return this.prisma.colaborador.create({
      data: {
        ...rest,
        dataAdmissao,
      },
    });
  }

  findAll() {
    return this.prisma.colaborador.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const colaborador = await this.prisma.colaborador.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!colaborador) {
      throw new NotFoundException(`Colaborador com ID ${id} não encontrado`);
    }

    return colaborador;
  }

  async update(id: number, updateColaboradorDto: UpdateColaboradorDto) {
    // Check CPF uniqueness if changing
    if (updateColaboradorDto.cpf) {
      const existing = await this.prisma.colaborador.findUnique({
        where: { cpf: updateColaboradorDto.cpf },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    let dataAdmissao: Date | null | undefined;
    if (updateColaboradorDto.dataAdmissao) {
      dataAdmissao = new Date(updateColaboradorDto.dataAdmissao);
    } else if (updateColaboradorDto.dataAdmissao === null) {
      dataAdmissao = null;
    }

    const { dataAdmissao: _, ...rest } = updateColaboradorDto;
    
    const data: any = { ...rest };
    if (dataAdmissao !== undefined) {
      data.dataAdmissao = dataAdmissao;
    }

    try {
      return await this.prisma.colaborador.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Colaborador com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Soft delete
      return await this.prisma.colaborador.update({
        where: { id },
        data: { ativo: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Colaborador com ID ${id} não encontrado`);
      }
      throw error;
    }
  }
}

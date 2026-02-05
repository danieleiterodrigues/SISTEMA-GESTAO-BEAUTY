import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProdutoDto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: createProdutoDto,
    });
  }

  findAll() {
    return this.prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return produto;
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto) {
    try {
      return await this.prisma.produto.update({
        where: { id },
        data: updateProdutoDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Produto com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.produto.update({
        where: { id },
        data: { ativo: false },
      });
    } catch (error) {
       if (error.code === 'P2025') {
        throw new NotFoundException(`Produto com ID ${id} não encontrado`);
      }
      throw error;
    }
  }
}

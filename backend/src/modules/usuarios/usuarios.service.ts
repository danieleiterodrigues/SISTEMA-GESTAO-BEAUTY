import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { senha, ...rest } = createUsuarioDto;

    // Check if email exists
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: rest.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Create user
    const user = await this.prisma.usuario.create({
      data: {
        ...rest,
        senhaHash,
      },
    });

    // Remove password hash from response
    const { senhaHash: _, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nome: 'asc' },
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { senha, ...rest } = updateUsuarioDto;

    // Check availability if email is being changed
    if (rest.email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: rest.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: any = { ...rest };

    // Hash new password if provided
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      data.senhaHash = await bcrypt.hash(senha, salt);
    }

    try {
      const user = await this.prisma.usuario.update({
        where: { id },
        data,
      });

      const { senhaHash: _, ...result } = user;
      return result;
    } catch (error) {
      // Prisma error code for record not found is P2025
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    // We can decide to soft delete (set ativo = false) or hard delete.
    // The plan said: "Schema has ativo, so we will toggle this flag."
    // Let's implement actual remove as setting active to false, or deleting?
    // Usually 'remove' implies delete. Let's do hard delete for now BUT check constraints.
    // Actually, usually safer to Soft Delete. Let's start with Soft Delete implementation named 'remove' or valid 'toggle'.
    // Standard CRUD 'remove' usually implies DELETE.
    // Given the prompt didn't specify strict soft delete on 'remove' endpoint, I will stick to standard Delete for 'remove' 
    // BUT since we have 'ativo', maybe 'remove' updates 'ativo' to false?
    // Let's Stick to Hard Delete for the 'DELETE' verb unless specified otherwise, or Soft Delete if I want to be safe.
    // Re-reading Plan: "remove: Soft delete or hard delete... Decision: Schema has ativo, so we will toggle this flag."
    // OK, so I should set ativo = false.
    
    try {
      return await this.prisma.usuario.update({
        where: { id },
        data: { ativo: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}

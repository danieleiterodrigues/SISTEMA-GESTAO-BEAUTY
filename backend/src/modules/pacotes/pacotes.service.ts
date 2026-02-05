import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePacoteDto } from './dto/create-pacote.dto';
import { UpdatePacoteDto } from './dto/update-pacote.dto';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPacoteDto: CreatePacoteDto) {
    const { servicos, ...pacoteData } = createPacoteDto;

    // Validate services exist if provided
    if (servicos && servicos.length > 0) {
      const serviceIds = servicos.map(s => s.servicoId);
      const existingServices = await this.prisma.servico.findMany({
        where: { id: { in: serviceIds } },
      });
      if (existingServices.length !== serviceIds.length) {
        throw new BadRequestException('Um ou mais serviços informados não existem');
      }
    }

    // Transaction to create Pacote and Links
    return this.prisma.$transaction(async (prisma) => {
        const pacote = await prisma.pacote.create({
            data: pacoteData,
        });

        if (servicos && servicos.length > 0) {
            await prisma.pacoteServico.createMany({
                data: servicos.map(s => ({
                    pacoteId: pacote.id,
                    servicoId: s.servicoId,
                    quantidade: s.quantidade
                }))
            });
        }

        return pacote;
    });
  }

  findAll() {
    return this.prisma.pacote.findMany({
      where: { ativo: true },
      include: {
        servicos: {
            include: {
                servico: true
            }
        }
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const pacote = await this.prisma.pacote.findUnique({
      where: { id },
      include: {
        servicos: {
            include: {
                servico: true
            }
        }
      },
    });

    if (!pacote) {
      throw new NotFoundException(`Pacote com ID ${id} não encontrado`);
    }

    return pacote;
  }

  async update(id: number, updatePacoteDto: UpdatePacoteDto) {
    const { servicos, ...pacoteData } = updatePacoteDto;
    
    // For now, simpler update of fields only. 
    // Updating nested relations (add/remove services) is complex and needs specific requirements.
    // If services are passed, we might replace all? Or append?
    // Let's stick to updating basic data for now to avoid accidental deletions of links.
    
    try {
      return await this.prisma.pacote.update({
        where: { id },
        data: pacoteData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Pacote com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.pacote.update({
        where: { id },
        data: { ativo: false },
      });
    } catch (error) {
       if (error.code === 'P2025') {
        throw new NotFoundException(`Pacote com ID ${id} não encontrado`);
      }
      throw error;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComissoesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.comissao.findMany({
      include: {
        colaborador: true,
        venda: true,
      },
      orderBy: { dataReferencia: 'desc' }
    });
  }

  // Future: Method `calcularComissoes` triggered by cron or manual action
}

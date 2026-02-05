import { Module } from '@nestjs/common';
import { PacoteVendasService } from './pacote-vendas.service';
import { PacoteVendasController } from './pacote-vendas.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PacoteVendasController],
  providers: [PacoteVendasService],
})
export class PacoteVendasModule {}

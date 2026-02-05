import { Module } from '@nestjs/common';
import { PacotesService } from './pacotes.service';
import { PacotesController } from './pacotes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PacotesController],
  providers: [PacotesService],
})
export class PacotesModule {}

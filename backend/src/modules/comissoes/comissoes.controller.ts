import { Controller, Get, UseGuards } from '@nestjs/common';
import { ComissoesService } from './comissoes.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('comissoes')
@UseGuards(JwtAuthGuard)
export class ComissoesController {
  constructor(private readonly comissoesService: ComissoesService) {}

  @Get()
  findAll() {
    return this.comissoesService.findAll();
  }
}

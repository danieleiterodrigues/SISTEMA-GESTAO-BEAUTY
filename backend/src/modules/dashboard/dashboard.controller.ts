import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetPrevisaoEntradaDto } from './dto/get-previsao-entrada.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('previsao-entrada')
  getPrevisaoEntrada(@Query() query: GetPrevisaoEntradaDto) {
    return this.dashboardService.getPrevisaoEntrada(query);
  }

  @Get('financeiro')
  getFinanceiro() {
    return this.dashboardService.getFinanceiro();
  }
}

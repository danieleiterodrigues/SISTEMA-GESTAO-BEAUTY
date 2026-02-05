import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  create(@Body() body: any) {
    // Custom body handling to extract items if present
    const { items, ...createVendaDto } = body; 
    // items expected to be array of { produtoId, quantidade }
    
    return this.vendasService.create(createVendaDto as CreateVendaDto, items);
  }



  @Get()
  findAll() {
    return this.vendasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendasService.findOne(+id);
  }
}

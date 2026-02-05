import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PacoteVendasService } from './pacote-vendas.service';
import { CreatePacoteVendaDto } from './dto/create-pacote-venda.dto';
import { UpdatePacoteVendaDto } from './dto/update-pacote-venda.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('pacote-vendas')
@UseGuards(JwtAuthGuard)
export class PacoteVendasController {
  constructor(private readonly service: PacoteVendasService) {}

  @Post()
  create(@Body() createDto: CreatePacoteVendaDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePacoteVendaDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}

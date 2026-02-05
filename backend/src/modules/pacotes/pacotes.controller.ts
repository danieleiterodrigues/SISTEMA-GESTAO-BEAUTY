import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PacotesService } from './pacotes.service';
import { CreatePacoteDto } from './dto/create-pacote.dto';
import { UpdatePacoteDto } from './dto/update-pacote.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('pacotes')
@UseGuards(JwtAuthGuard)
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @Post()
  create(@Body() createPacoteDto: CreatePacoteDto) {
    return this.pacotesService.create(createPacoteDto);
  }

  @Get()
  findAll() {
    return this.pacotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pacotesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePacoteDto: UpdatePacoteDto) {
    return this.pacotesService.update(+id, updatePacoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pacotesService.remove(+id);
  }
}

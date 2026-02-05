import { PartialType } from '@nestjs/mapped-types';
import { CreatePacoteVendaDto } from './create-pacote-venda.dto';

export class UpdatePacoteVendaDto extends PartialType(CreatePacoteVendaDto) {}

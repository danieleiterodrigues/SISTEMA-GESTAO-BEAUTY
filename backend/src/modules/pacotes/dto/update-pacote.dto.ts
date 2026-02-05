import { PartialType } from '@nestjs/mapped-types';
import { CreatePacoteDto } from './create-pacote.dto';

export class UpdatePacoteDto extends PartialType(CreatePacoteDto) {}

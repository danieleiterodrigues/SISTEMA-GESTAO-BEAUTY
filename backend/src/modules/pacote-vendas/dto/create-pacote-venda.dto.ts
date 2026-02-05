import { IsInt, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum, IsString } from 'class-validator';
import { StatusPacoteVenda } from '@prisma/client';

export class CreatePacoteVendaDto {
  @IsInt()
  @IsNotEmpty()
  clienteId: number;

  @IsInt()
  @IsNotEmpty()
  pacoteId: number;

  @IsDateString()
  @IsNotEmpty()
  dataVenda: string; // YYYY-MM-DD

  @IsDateString()
  @IsNotEmpty()
  dataEvento: string; // YYYY-MM-DD

  @IsNumber()
  @Min(0)
  valorTotal: number;

  @IsNumber()
  @Min(0)
  valorPago: number;

  @IsOptional()
  @IsEnum(StatusPacoteVenda)
  status?: StatusPacoteVenda;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

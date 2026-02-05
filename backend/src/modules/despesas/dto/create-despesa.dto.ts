import { IsString, IsNotEmpty, IsNumber, Min, IsDateString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { StatusDespesa } from '@prisma/client';

export class CreateDespesaDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsNumber()
  @Min(0)
  valor: number;

  @IsDateString()
  @IsNotEmpty()
  dataVencimento: string;

  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @IsEnum(StatusDespesa)
  @IsNotEmpty()
  status: StatusDespesa;

  @IsBoolean()
  @IsOptional()
  recorrente?: boolean;

  @IsOptional()
  @IsString()
  periodicidade?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';

  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

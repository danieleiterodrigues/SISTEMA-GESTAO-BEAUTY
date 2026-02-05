import { IsInt, IsNotEmpty, IsDateString, IsString, IsOptional, IsEnum, IsArray, IsNumber, Min } from 'class-validator';
import { StatusAtendimento, TipoAtendimento } from '@prisma/client';

export class CreateAtendimentoDto {
  @IsInt({ message: 'Cliente ID deve ser um número inteiro' })
  @IsNotEmpty({ message: 'Cliente ID é obrigatório' })
  clienteId: number;

  @IsOptional()
  @IsInt({ message: 'Colaborador ID deve ser um número inteiro' })
  colaboradorId?: number;

  @IsOptional()
  @IsEnum(TipoAtendimento, { message: 'Tipo de atendimento inválido' })
  tipo?: TipoAtendimento;

  @IsDateString({}, { message: 'Data de atendimento inválida' })
  @IsNotEmpty({ message: 'Data de atendimento é obrigatória' })
  dataAtendimento: string;

  @IsOptional()
  @IsString({ message: 'Horário de início inválido' })
  horarioInicio?: string;

  @IsOptional()
  @IsString({ message: 'Horário de fim inválido' })
  horarioFim?: string;

  @IsOptional()
  @IsEnum(StatusAtendimento)
  status?: StatusAtendimento;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPago?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsArray({ message: 'Serviços deve ser uma lista de IDs' })
  @IsInt({ each: true, message: 'ID do serviço deve ser um número inteiro' })
  servicos: number[];
}

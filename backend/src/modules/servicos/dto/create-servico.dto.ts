import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ComissaoTipo } from '@prisma/client';

export class CreateServicoDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  @IsString()
  categoria?: string; // Mantido para compatibilidade ou refatorar? O PRD fala em relation. Vamos adicionar categoriaId.

  @IsOptional()
  @IsNumber({}, { message: 'O ID da categoria deve ser um número' })
  categoriaId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O valor de custo deve ser um número' })
  valorCusto?: number;

  @IsNumber({}, { message: 'A duração deve ser um número (minutos)' })
  @IsNotEmpty({ message: 'A duração é obrigatória' })
  duracaoMinutos: number;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  valor: number;

  @IsEnum(ComissaoTipo, { message: 'Tipo de comissão inválido' })
  @IsNotEmpty({ message: 'O tipo de comissão é obrigatório' })
  comissaoTipo: ComissaoTipo;

  @IsNumber({}, { message: 'O valor da comissão deve ser um número' })
  @IsNotEmpty({ message: 'O valor da comissão é obrigatório' })
  comissaoValor: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

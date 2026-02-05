import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { TipoColaborador } from '@prisma/client';

export class CreateColaboradorDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsEnum(TipoColaborador, { message: 'Tipo de colaborador inválido' })
  @IsNotEmpty({ message: 'O tipo de colaborador é obrigatório' })
  tipo: TipoColaborador;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  dataAdmissao?: string; // ISO string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comissaoPadrao?: number;

  @IsOptional()
  @IsNumber()
  usuarioId?: number;
}

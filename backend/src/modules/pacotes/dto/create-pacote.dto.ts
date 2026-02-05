import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PacoteServicoDto {
  @IsNumber()
  servicoId: number;

  @IsNumber()
  @Min(1)
  quantidade: number;
}

export class CreatePacoteDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNumber()
  @Min(0)
  valor: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  validadeDias?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PacoteServicoDto)
  servicos?: PacoteServicoDto[];
}

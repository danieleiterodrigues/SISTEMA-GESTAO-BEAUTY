import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsDecimal } from 'class-validator';

export class CreateProdutoDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorCusto?: number;

  @IsNumber()
  @Min(0, { message: 'O valor de venda não pode ser negativo' })
  valorVenda: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueAtual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueMinimo?: number;
}

import { IsOptional, IsString, IsIn } from 'class-validator';

export class GetPrevisaoEntradaDto {
  @IsOptional()
  @IsIn(['7d', '15d', '30d', 'personalizado'])
  periodo?: '7d' | '15d' | '30d' | 'personalizado';

  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;
}

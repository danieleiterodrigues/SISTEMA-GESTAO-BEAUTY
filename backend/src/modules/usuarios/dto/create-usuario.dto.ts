import { IsString, IsEmail, IsNotEmpty, IsEnum, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { Perfil } from '@prisma/client';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nome: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  senha: string;

  @IsNotEmpty()
  @IsEnum(Perfil)
  perfil: Perfil;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    minLength: 8,
    description: 'Mínimo 8 caracteres, deve conter maiúscula, minúscula, número e símbolo',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'A senha deve ter no máximo 128 caracteres' })
  @Matches(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula' })
  @Matches(/\d/, { message: 'A senha deve conter pelo menos um número' })
  @Matches(/[^A-Za-z0-9]/, { message: 'A senha deve conter pelo menos um caractere especial' })
  password: string;

  @ApiProperty({ example: 'João Silva', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

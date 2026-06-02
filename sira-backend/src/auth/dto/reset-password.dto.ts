import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Match } from '../../common/validators/match.validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperação recebido por e-mail' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nova senha — mínimo 8 caracteres, deve conter maiúscula, minúscula, número e símbolo',
    example: 'NovaSenha@123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'A senha deve ter no máximo 128 caracteres' })
  @Matches(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula' })
  @Matches(/\d/, { message: 'A senha deve conter pelo menos um número' })
  @Matches(/[^A-Za-z0-9]/, { message: 'A senha deve conter pelo menos um caractere especial' })
  newPassword: string;

  @ApiProperty({ description: 'Deve ser idêntica ao campo newPassword' })
  @IsString()
  @Match('newPassword', { message: 'A confirmação de senha não confere' })
  confirmNewPassword: string;
}

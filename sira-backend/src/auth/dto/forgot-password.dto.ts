import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'E-mail cadastrado na conta' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;
}

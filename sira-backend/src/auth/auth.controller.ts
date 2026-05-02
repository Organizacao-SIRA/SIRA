import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
<<<<<<< HEAD
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
=======
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

>>>>>>> develop
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
<<<<<<< HEAD
  @ApiOperation({ summary: 'Cadastro de novo usuário' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login e geração de token JWT' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
=======
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
>>>>>>> develop
  }
}

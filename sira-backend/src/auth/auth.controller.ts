import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Headers,
} from '@nestjs/common';
import { ERROR_CODES } from '../common/constants/error-codes';
import { unauthorizedError } from '../common/errors/http-error';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { authMessages, normalizeUiLocale } from './auth-i18n';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(ACCESS_COOKIE, accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  }

  @Post('register')
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } })
  @ApiOperation({ summary: 'Cadastro de novo usuário' })
  async register(
    @Body() dto: RegisterDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.register(dto, acceptLanguage);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Login e geração de token JWT' })
  async login(
    @Body() dto: LoginDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto, acceptLanguage);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renova access token via refresh token' })
  async refresh(
    @Req() req: Request,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyToken?: string,
  ) {
    const messages = authMessages[normalizeUiLocale(acceptLanguage)];
    const token = req.cookies?.[REFRESH_COOKIE] ?? bodyToken;
    if (!token) {
      this.clearAuthCookies(res);
      throw unauthorizedError(ERROR_CODES.AUTH_MISSING_REFRESH_TOKEN, messages.missingRefreshToken);
    }
    const { accessToken, refreshToken } = await this.authService.refreshAccessToken(token, acceptLanguage);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { ok: true, accessToken, refreshToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerra a sessão' })
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { ok: true };
  }

  // ── Password Recovery ───────────────────────────────────────────

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 900_000, limit: 3 } }) // 3 requests per 15 minutes
  @ApiOperation({ summary: 'Solicita recuperação de senha' })
  @ApiResponse({
    status: 202,
    description: 'Resposta uniforme — sempre retorna sucesso (anti-enumeração)',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ) {
    const messages = authMessages[normalizeUiLocale(acceptLanguage)];
    await this.authService.forgotPassword(dto.email, acceptLanguage);
    return {
      message: messages.forgotPasswordAccepted,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900_000, limit: 5 } }) // 5 requests per 15 minutes
  @ApiOperation({ summary: 'Redefine a senha usando token de recuperação' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ) {
    const messages = authMessages[normalizeUiLocale(acceptLanguage)];
    await this.authService.resetPassword(dto.token, dto.newPassword, acceptLanguage);
    return { message: messages.resetPasswordSuccess };
  }

  @Get('validate-reset-token')
  @Throttle({ default: { ttl: 900_000, limit: 10 } }) // 10 requests per 15 minutes
  @ApiOperation({ summary: 'Verifica se um token de reset é válido' })
  @ApiResponse({ status: 200, description: 'Retorna { valid: boolean }' })
  async validateResetToken(@Query('token') token: string) {
    if (!token) return { valid: false };
    return this.authService.validateResetToken(token);
  }
}

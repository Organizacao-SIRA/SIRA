import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        if (payload.type !== 'refresh') {
          request['user'] = payload;
        }
      } catch {
        // Token inválido — continua sem usuário autenticado
      }
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    if ((request.cookies as any)?.access_token) return (request.cookies as any).access_token;
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}

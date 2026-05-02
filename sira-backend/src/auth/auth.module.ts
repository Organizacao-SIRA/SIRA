import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sira_secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}

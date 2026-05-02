import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}.${derivedKey.toString('hex')}`;
  }

  private async comparePasswords(password: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split('.');
    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashBuffer, derivedKey);
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });

    return { access_token: this.sign(user), user: this.safeUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await this.comparePasswords(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return { access_token: this.sign(user), user: this.safeUser(user) };
  }

  private sign(user: { id: string; email: string }) {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private safeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      course: user.course,
      educationLevel: user.educationLevel,
      mainArea: user.mainArea,
      subAreas: user.subAreas,
      languages: user.languages,
      materialLevels: user.materialLevels,
      wantsBooks: user.wantsBooks,
      wantsArticles: user.wantsArticles,
      interests: user.interests,
    };
  }
}

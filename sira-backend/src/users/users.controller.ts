import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

interface MulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Get('preference-options')
  getPreferenceOptions() {
    return this.usersService.getPreferenceOptions();
  }

  @Patch('onboarding')
  completeOnboarding(@CurrentUser() user: JwtPayload, @Body() dto: CompleteOnboardingDto) {
    return this.usersService.completeOnboarding(user.sub, dto);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('profile/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: MAX_AVATAR_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(new BadRequestException('Apenas imagens JPG, PNG ou WEBP são permitidas'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(@CurrentUser() user: JwtPayload, @UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    return this.usersService.updateAvatar(user.sub, file.filename);
  }

  @Delete('profile/avatar')
  removeAvatar(@CurrentUser() user: JwtPayload) {
    return this.usersService.removeAvatar(user.sub);
  }
}

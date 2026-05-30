import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AvatarStorageService } from './avatar-storage/avatar-storage.service';
import { CloudinaryAvatarStorageService } from './avatar-storage/cloudinary-avatar-storage.service';
import { LocalAvatarStorageService } from './avatar-storage/local-avatar-storage.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AvatarStorageService,
    LocalAvatarStorageService,
    CloudinaryAvatarStorageService,
  ],
  exports: [UsersService],
})
export class UsersModule {}

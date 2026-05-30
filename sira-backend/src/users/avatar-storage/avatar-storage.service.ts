import { Injectable } from '@nestjs/common';
import { CloudinaryAvatarStorageService, isCloudinaryConfigured } from './cloudinary-avatar-storage.service';
import { LocalAvatarStorageService } from './local-avatar-storage.service';
import type { AvatarStorage, AvatarStorageDriver } from './avatar-storage.types';

const isProduction = () => process.env.NODE_ENV === 'production';

const resolveAvatarStorageDriver = (): AvatarStorageDriver => {
  const configured = process.env.AVATAR_STORAGE_DRIVER?.trim().toLowerCase();
  if (configured === 'local' || configured === 'cloudinary') return configured;
  if (isCloudinaryConfigured()) return 'cloudinary';
  return isProduction() ? 'cloudinary' : 'local';
};

@Injectable()
export class AvatarStorageService implements AvatarStorage {
  constructor(
    private readonly localStorage: LocalAvatarStorageService,
    private readonly cloudinaryStorage: CloudinaryAvatarStorageService,
  ) {}

  upload(buffer: Buffer, mimetype: string, userId: string): Promise<string> {
    return this.activeStorage.upload(buffer, mimetype, userId);
  }

  async delete(avatarUrl: string | null): Promise<void> {
    await Promise.all([
      this.localStorage.delete(avatarUrl),
      this.cloudinaryStorage.delete(avatarUrl),
    ]);
  }

  async deleteReplaced(previousAvatarUrl: string | null, nextAvatarUrl: string): Promise<void> {
    if (!previousAvatarUrl || previousAvatarUrl === nextAvatarUrl) return;

    const previousIsCloudinary = previousAvatarUrl.includes('cloudinary.com');
    const nextIsCloudinary = nextAvatarUrl.includes('cloudinary.com');
    if (previousIsCloudinary && nextIsCloudinary) return;

    await this.delete(previousAvatarUrl);
  }

  private get activeStorage(): AvatarStorage {
    return resolveAvatarStorageDriver() === 'cloudinary'
      ? this.cloudinaryStorage
      : this.localStorage;
  }
}

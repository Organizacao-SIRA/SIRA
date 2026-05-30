import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import type { AvatarStorage } from './avatar-storage.types';

const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');
const AVATAR_EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class LocalAvatarStorageService implements AvatarStorage {
  async upload(buffer: Buffer, mimetype: string, userId: string): Promise<string> {
    const ext = AVATAR_EXTENSION_BY_MIME[mimetype];
    if (!ext) throw new BadRequestException('Formato de imagem inválido');

    await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });
    const filename = `${userId}-${Date.now()}.${ext}`;
    await writeFile(join(AVATAR_UPLOAD_DIR, filename), buffer);
    return `/uploads/avatars/${filename}`;
  }

  async delete(avatarUrl: string | null): Promise<void> {
    if (!avatarUrl?.startsWith('/uploads/avatars/')) return;

    const filename = basename(avatarUrl);
    if (!extname(filename)) return;

    try {
      await unlink(join(AVATAR_UPLOAD_DIR, filename));
    } catch {
      // Avatar cleanup should not block profile updates.
    }
  }
}


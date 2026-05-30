import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { AvatarStorage } from './avatar-storage.types';

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

export const isCloudinaryConfigured = () =>
  Boolean(CLOUDINARY_CONFIG.cloud_name && CLOUDINARY_CONFIG.api_key && CLOUDINARY_CONFIG.api_secret);

@Injectable()
export class CloudinaryAvatarStorageService implements AvatarStorage {
  constructor() {
    if (isCloudinaryConfigured()) {
      cloudinary.config(CLOUDINARY_CONFIG);
    }
  }

  upload(buffer: Buffer, mimetype: string, userId: string): Promise<string> {
    if (!isCloudinaryConfigured()) {
      throw new ServiceUnavailableException('Upload de imagem indisponível: Cloudinary não configurado');
    }

    return new Promise((resolve, reject) => {
      const ext = mimetype.split('/')[1];
      try {
        cloudinary.uploader.upload_stream(
          { folder: 'sira/avatars', public_id: userId, overwrite: true, format: ext },
          (error, result) => {
            if (error || !result) return reject(new BadRequestException('Erro ao enviar imagem para o Cloudinary'));
            resolve(result.secure_url);
          },
        ).end(buffer);
      } catch {
        reject(new ServiceUnavailableException('Upload de imagem indisponível no momento'));
      }
    });
  }

  async delete(avatarUrl: string | null): Promise<void> {
    if (!avatarUrl?.includes('cloudinary.com')) return;
    if (!isCloudinaryConfigured()) return;

    try {
      await cloudinary.uploader.destroy('sira/avatars/' + avatarUrl.split('/').pop()?.split('.')[0]);
    } catch {
      // Avatar cleanup should not block profile updates.
    }
  }
}


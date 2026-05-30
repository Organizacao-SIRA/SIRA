export interface AvatarStorage {
  upload(buffer: Buffer, mimetype: string, userId: string): Promise<string>;
  delete(avatarUrl: string | null): Promise<void>;
}

export type AvatarStorageDriver = 'local' | 'cloudinary';


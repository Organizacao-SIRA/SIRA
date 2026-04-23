import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { MaterialsModule } from '../materials/materials.module';

@Module({
  imports: [MaterialsModule],
  providers: [FavoritesService],
  controllers: [FavoritesController]
})
export class FavoritesModule {}

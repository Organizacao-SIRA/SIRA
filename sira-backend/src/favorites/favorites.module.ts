import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
<<<<<<< HEAD

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
=======
import { MaterialsModule } from '../materials/materials.module';

@Module({
  imports: [MaterialsModule],
  providers: [FavoritesService],
  controllers: [FavoritesController]
>>>>>>> develop
})
export class FavoritesModule {}

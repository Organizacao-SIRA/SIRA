import { Module, Get, Controller } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MaterialsModule } from './materials/materials.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Controller()
class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'up',
      timestamp: new Date().toISOString(),
      service: 'SIRA+ API',
    };
  }
}

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MaterialsModule,
    FavoritesModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

import { Module, Get, Controller } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MaterialsModule } from './materials/materials.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FavoritesModule } from './favorites/favorites.module';

@Controller()
class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'up',
      timestamp: new Date().toISOString(),
      service: 'SIRA+ API'
    };
  }
}

@Module({
  imports: [
    HttpModule,
    MaterialsModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    FavoritesModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

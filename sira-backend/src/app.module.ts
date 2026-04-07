import { Module, Get, Controller } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MaterialsModule } from './materials/materials.module';

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
    MaterialsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

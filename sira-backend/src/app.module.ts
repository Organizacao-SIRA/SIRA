import { Module, Get, Controller } from '@nestjs/common';

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
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

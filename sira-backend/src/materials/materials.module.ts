import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [HttpModule, AiModule],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}

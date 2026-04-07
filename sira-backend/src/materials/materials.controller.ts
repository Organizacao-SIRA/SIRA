import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { MaterialDto } from './dto/material.dto';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Busca unificada em APIs acadêmicas externas' })
  @ApiResponse({ status: 200, type: [MaterialDto] })
  async search(@Query('q') query: string): Promise<MaterialDto[]> {
    return this.materialsService.search(query);
  }
}

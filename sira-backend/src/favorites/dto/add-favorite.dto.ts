import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { MaterialType } from '../../materials/dto/material.dto';

export class AddFavoriteDto {
  @ApiProperty({ example: 'ss-abc123' })
  @IsString()
  id: string;

  @ApiProperty({ enum: MaterialType })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty({ example: 'Deep Learning' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Ian Goodfellow' })
  @IsString()
  authors: string;

  @ApiProperty({ example: '2016' })
  @IsString()
  year: string;

  @ApiProperty({ example: 'Semantic Scholar' })
  @IsString()
  source: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  relevance?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  doi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thematicArea?: string;
}

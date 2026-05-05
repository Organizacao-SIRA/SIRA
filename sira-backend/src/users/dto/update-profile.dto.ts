import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  mainArea?: string;

  @IsOptional()
  @IsString()
  subAreas?: string;

  @IsOptional()
  @IsArray()
  languages?: string[];

  @IsOptional()
  @IsArray()
  materialLevels?: string[];

  @IsOptional()
  @IsBoolean()
  wantsBooks?: boolean;

  @IsOptional()
  @IsBoolean()
  wantsArticles?: boolean;

  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsString()
  academicGoal?: string;
}

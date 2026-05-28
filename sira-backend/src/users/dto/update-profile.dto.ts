import { IsString, IsOptional, IsBoolean, IsArray, IsIn } from 'class-validator';
import {
  ACADEMIC_GOAL_LIST,
  EDUCATION_LEVEL_LIST,
  LANGUAGE_LIST,
  MATERIAL_LEVEL_LIST,
  PREFERENCE_TOPIC_IDS,
} from '../preferences-options';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsIn(EDUCATION_LEVEL_LIST)
  educationLevel?: string;

  @IsOptional()
  @IsIn(PREFERENCE_TOPIC_IDS)
  mainArea?: string;

  @IsOptional()
  @IsString()
  subAreas?: string;

  @IsOptional()
  @IsArray()
  @IsIn(LANGUAGE_LIST, { each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(MATERIAL_LEVEL_LIST, { each: true })
  materialLevels?: string[];

  @IsOptional()
  @IsBoolean()
  wantsBooks?: boolean;

  @IsOptional()
  @IsBoolean()
  wantsArticles?: boolean;

  @IsOptional()
  @IsBoolean()
  wantsOpenAccessOnly?: boolean;

  @IsOptional()
  @IsArray()
  @IsIn(PREFERENCE_TOPIC_IDS, { each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  @IsIn(ACADEMIC_GOAL_LIST)
  academicGoal?: string;
}

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  ACADEMIC_GOAL_LIST,
  EDUCATION_LEVEL_LIST,
  LANGUAGE_LIST,
  MATERIAL_LEVEL_LIST,
  PREFERENCE_TOPIC_IDS,
} from '../preferences-options';

export class CompleteOnboardingDto {
  @IsString()
  @MinLength(2)
  course: string;

  @IsString()
  @IsIn(EDUCATION_LEVEL_LIST)
  educationLevel: string;

  @IsString()
  @IsIn(PREFERENCE_TOPIC_IDS)
  mainArea: string;

  @IsOptional()
  @IsString()
  subAreas?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(LANGUAGE_LIST, { each: true })
  languages: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(MATERIAL_LEVEL_LIST, { each: true })
  materialLevels: string[];

  @IsBoolean()
  wantsBooks: boolean;

  @IsBoolean()
  wantsArticles: boolean;

  @IsArray()
  @ArrayMinSize(3)
  @IsIn(PREFERENCE_TOPIC_IDS, { each: true })
  interests: string[];

  @IsOptional()
  @IsString()
  @IsIn(ACADEMIC_GOAL_LIST)
  academicGoal?: string;
}

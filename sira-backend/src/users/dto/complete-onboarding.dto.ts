import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @MinLength(2)
  course: string;

  @IsString()
  educationLevel: string;

  @IsString()
  @MinLength(2)
  mainArea: string;

  @IsOptional()
  @IsString()
  subAreas?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  materialLevels: string[];

  @IsBoolean()
  wantsBooks: boolean;

  @IsBoolean()
  wantsArticles: boolean;

  @IsArray()
  @ArrayMinSize(3)
  @IsString({ each: true })
  interests: string[];

  @IsOptional()
  @IsString()
  academicGoal?: string;
}

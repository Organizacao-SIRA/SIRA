import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export enum MaterialType {
  BOOK = 'book',
  ARTICLE = 'article',
}

export class MaterialDto {
  @ApiProperty({ example: 'gb-123', description: 'ID único gerado pelo backend' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: MaterialType, example: 'book' })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty({ example: 'Design Patterns', description: 'Título do material' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Erich Gamma, Richard Helm', description: 'Autores formatados' })
  @IsString()
  @IsNotEmpty()
  authors: string;

  @ApiProperty({ example: '1994', description: 'Ano de publicação' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ example: 'Google Books', description: 'Fonte original do dado' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 95, description: 'Relevância calculada pela IA (Score 0-100)' })
  @IsNumber()
  relevance: number;

  @ApiProperty({ example: 'Resumo do conteúdo...', description: 'Descrição ou abstract' })
  @IsString()
  @IsOptional()
  abstract: string;

  @ApiProperty({ example: 'http://...', description: 'Link da imagem de capa', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 'https://books.google.com/...', description: 'Link de acesso ao material', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thematicArea?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  doi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({ example: 'Intermediário', required: false })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aiJustification?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aiExplanation?: string | null;

  @ApiProperty({ example: 'pt', description: 'Código ISO 639-1 do idioma', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  keywords?: string[];
}

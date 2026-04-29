import { ApiProperty } from '@nestjs/swagger';

export enum MaterialType {
  BOOK = 'book',
  ARTICLE = 'article',
}

export class MaterialDto {
  @ApiProperty({ example: 'gb-123', description: 'ID único gerado pelo backend' })
  id: string;

  @ApiProperty({ enum: MaterialType, example: 'book' })
  type: MaterialType;

  @ApiProperty({ example: 'Design Patterns', description: 'Título do material' })
  title: string;

  @ApiProperty({ example: 'Erich Gamma, Richard Helm', description: 'Autores formatados' })
  authors: string;

  @ApiProperty({ example: '1994', description: 'Ano de publicação' })
  year: string;

  @ApiProperty({ example: 'Google Books', description: 'Fonte original do dado' })
  source: string;

  @ApiProperty({ example: 95, description: 'Relevância calculada pela IA (Score 0-100)' })
  relevance: number;

  @ApiProperty({ example: 'Resumo do conteúdo...', description: 'Descrição ou abstract' })
  abstract: string;

  @ApiProperty({ example: 'http://...', description: 'Link da imagem de capa', required: false })
  image?: string;

  @ApiProperty({ example: 'https://books.google.com/...', description: 'Link de acesso ao material', required: false })
  url?: string;
}

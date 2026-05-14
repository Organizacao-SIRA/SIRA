import { ApiProperty } from '@nestjs/swagger';
import { MaterialDto } from './material.dto';

export class ChatSearchResponseDto {
  @ApiProperty({ example: 'Com base no seu pedido, encontrei estes materiais...', description: 'Mensagem explicativa da IA' })
  aiMessage: string;

  @ApiProperty({ type: [MaterialDto], description: 'Lista de materiais recomendados' })
  results: MaterialDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class TrackEventDto {
  @ApiProperty({ example: 'ss-abc123' })
  @IsString()
  materialId: string;

  @ApiProperty({ enum: ['impression', 'click', 'favorite'] })
  @IsIn(['impression', 'click', 'favorite'])
  eventType: 'impression' | 'click' | 'favorite';
}

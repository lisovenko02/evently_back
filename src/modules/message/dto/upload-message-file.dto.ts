import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UploadMessageFileDto {
  @Type(() => Number)
  @IsInt()
  chatId: number;

  @Type(() => Number)
  @IsInt()
  eventId: number;
}

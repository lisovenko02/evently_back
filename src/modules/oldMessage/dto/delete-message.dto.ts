import { IsInt } from 'class-validator';

export class DeleteMessageStatusDto {
  @IsInt()
  eventId: number;
}

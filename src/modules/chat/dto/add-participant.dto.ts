import { IsInt } from 'class-validator';

export class AddParticipantDto {
  @IsInt()
  eventUserId: number;
}

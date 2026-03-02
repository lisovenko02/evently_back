import { IsInt } from 'class-validator';

export class CreatePrivateChatDto {
  @IsInt()
  eventId: number;

  @IsInt()
  receiverEventUserId: number;
}

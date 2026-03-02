import { Transform } from 'class-transformer';
import { IsInt, IsString, IsArray, ArrayMinSize } from 'class-validator';

export class CreateGroupChatDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  eventId: number;

  @IsString()
  name: string;

  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  @IsArray()
  @ArrayMinSize(1)
  participantIds: number[];
}

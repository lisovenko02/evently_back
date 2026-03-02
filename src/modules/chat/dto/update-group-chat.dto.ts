import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGroupChatDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

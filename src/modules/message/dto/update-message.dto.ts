import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  content?: string;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class AttachmentDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  fileUrl: string;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content: string;

  @Type(() => Number)
  @IsInt()
  chatId: number;

  @Type(() => Number)
  @IsInt()
  senderId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  eventId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

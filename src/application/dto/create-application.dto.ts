import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  eventId: number;

  @IsOptional()
  @IsString()
  senderComment?: string;
}

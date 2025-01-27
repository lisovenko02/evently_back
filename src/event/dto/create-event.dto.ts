import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  points: number;

  @IsNumber()
  @IsOptional()
  membersLimit?: number;
}

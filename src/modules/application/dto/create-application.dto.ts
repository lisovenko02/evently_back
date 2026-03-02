import { ApplicationType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsEnum(ApplicationType)
  type: ApplicationType;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsInt()
  receiverId?: number;
}

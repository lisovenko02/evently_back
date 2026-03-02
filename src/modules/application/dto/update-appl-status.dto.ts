import { ApplicationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsString()
  @IsOptional()
  decisionByComment?: string;

  @IsEnum([ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED])
  status: 'ACCEPTED' | 'REJECTED';
}

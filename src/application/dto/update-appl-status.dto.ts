import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsInt()
  applicationId: number;

  @IsInt()
  eventId: number;

  @IsString()
  @IsOptional()
  approverComment: string;

  @IsEnum(['ACCEPTED', 'REJECTED'])
  status: 'ACCEPTED' | 'REJECTED';
}

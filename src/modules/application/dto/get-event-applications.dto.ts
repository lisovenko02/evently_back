import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

enum ApplicationView {
  NEEDS_ACTION = 'NEEDS_ACTION',
  INVITES = 'INVITES',
  RESOLVED = 'RESOLVED',
  ALL = 'ALL',
}

export class GetEventApplicationsQueryDto {
  @IsEnum(ApplicationView)
  @IsOptional()
  view?: ApplicationView;

  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  to?: Date;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  cursor?: number;
}

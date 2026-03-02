import { EventUserHistoryStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class GetEventUserHistoryQueryDto {
  @IsOptional()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return value.split(',').map(Number);
    return [];
  })
  userIds?: number[];

  @IsOptional()
  @IsEnum(EventUserHistoryStatus, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return [];
  })
  statuses?: EventUserHistoryStatus[];

  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  to?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;
}

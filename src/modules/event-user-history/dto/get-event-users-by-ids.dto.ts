import { IsArray, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetEventUsersByIdsDto {
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return value.split(',').map(Number);
    return [];
  })
  userIds: number[];
}

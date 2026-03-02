import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SearchEventUsersQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  // @IsEnum(['SUGGEST', 'FULL'])
  // mode: 'SUGGEST' | 'FULL';
}

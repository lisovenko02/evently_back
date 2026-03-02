import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ColumnOrder {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderColumnsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOrder)
  columns: ColumnOrder[];
}

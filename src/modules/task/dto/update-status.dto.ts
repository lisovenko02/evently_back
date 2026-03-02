import { IsInt } from 'class-validator';

export class UpdateTaskColumnDto {
  @IsInt()
  newColumnId: number;
}

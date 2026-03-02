import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @IsInt()
  @IsNotEmpty()
  assigneeId: number;
}

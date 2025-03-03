import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @IsInt()
  @IsNotEmpty()
  assigneeId: number;
}

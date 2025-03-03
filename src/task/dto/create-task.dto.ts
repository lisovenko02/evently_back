import { TaskPriority, TaskStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @IsInt()
  @IsOptional()
  assigneeId: number;
}

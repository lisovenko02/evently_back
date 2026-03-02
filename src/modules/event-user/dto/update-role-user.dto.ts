import { Role } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateEventUserRoleDto {
  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @IsInt()
  @IsNotEmpty()
  eventUserId: number;

  @IsEnum([Role.MODERATOR, Role.USER])
  role: 'MODERATOR' | 'USER';
}

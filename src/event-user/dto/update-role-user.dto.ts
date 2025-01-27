import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateEventUserRoleDto {
  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(['MODERATOR', 'USER'])
  role: 'MODERATOR' | 'USER';
}

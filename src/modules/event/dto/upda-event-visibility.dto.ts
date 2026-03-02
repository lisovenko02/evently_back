import { EventVisibility } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateEventVisibilityDto {
  @IsEnum(EventVisibility)
  visibility: EventVisibility;
}

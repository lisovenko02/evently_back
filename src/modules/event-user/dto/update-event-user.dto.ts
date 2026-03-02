import { PartialType } from '@nestjs/mapped-types';
import { CreateEventUserDto } from './create-event-user.dto';

export class UpdateEventUserDto extends PartialType(CreateEventUserDto) {}

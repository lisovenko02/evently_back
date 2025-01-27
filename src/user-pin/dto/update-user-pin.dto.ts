import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPinDto } from './create-user-pin.dto';

export class UpdateUserPinDto extends PartialType(CreateUserPinDto) {}

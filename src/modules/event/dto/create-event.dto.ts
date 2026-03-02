import { EventCategory, EventVisibility } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString({ message: 'Image must be a string (URL)' })
  @IsOptional()
  image: string;

  @IsNumber({}, { message: 'Points must be a number' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  points?: number;

  @IsEnum(EventCategory, { message: 'Invalid category' })
  @IsNotEmpty({ message: 'Category is required' })
  category: EventCategory;

  @IsDate({ message: 'Start time must be a valid date' })
  @IsOptional()
  @Type(() => Date)
  startTime?: Date;

  @IsDate({ message: 'End time must be a valid date' })
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'isOnline must be a boolean' })
  isOnline: boolean;

  @ValidateIf((o) => !o.isOnline)
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address!: string;

  @ValidateIf((o) => !o.isOnline)
  @IsString({ message: 'City must be a string' })
  @IsOptional()
  city!: string;

  @ValidateIf((o) => !o.isOnline)
  @IsString({ message: 'Country must be a string' })
  @IsOptional()
  country!: string;

  @ValidateIf((o) => !o.isOnline)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Latitude must be a number' })
  latitude: number;

  @ValidateIf((o) => !o.isOnline)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Longitude must be a number' })
  longitude: number;

  @IsEnum(EventVisibility, { message: 'Invalid visibility value' })
  @IsNotEmpty({ message: 'Visibility is required' })
  visibility: EventVisibility;

  @IsNumber({}, { message: 'Max participants must be a number' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  maxParticipants?: number;
}

import { EventCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
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
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventCategory)
  @IsNotEmpty()
  category: EventCategory;

  @IsDate()
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsString()
  @IsOptional()
  image?: string;

  // @IsNumber()
  // points: number;

  // @IsNumber()
  // @IsOptional()
  // membersLimit?: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isOnline: boolean;

  @ValidateIf((o) => !o.isOnline)
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ValidateIf((o) => !o.isOnline)
  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value)) // Перетворюємо string в number
  points: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  membersLimit: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  latitude: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  longitude: number;
}

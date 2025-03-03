import { PinRarity } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePinDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PinRarity)
  @IsNotEmpty()
  rarity: PinRarity;

  @IsNumber()
  @IsNotEmpty()
  pointsCost: number;
}

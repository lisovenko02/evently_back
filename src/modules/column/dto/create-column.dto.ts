import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

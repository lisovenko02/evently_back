import { IsString, IsEmail } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail({}, { message: 'Enter a valid email' })
  email: string;

  @IsString()
  password: string;
}

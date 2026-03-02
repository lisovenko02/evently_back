import { Controller, Post, Body, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/signIn.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  registerUser(@Body() signUpDto: SignUpDto) {
    return this.authService.register(signUpDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  loginUser(@Body() signInDto: SignInDto, @Res() res: Response) {
    return this.authService.login(signInDto, res);
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshTokens(req, res);
  }
}

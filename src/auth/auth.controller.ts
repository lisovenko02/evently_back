import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { Public } from './decorators/public.decorator';

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
  loginUser(@Request() req) {
    return this.authService.login(req.user.id, req.user.username);
  }
}

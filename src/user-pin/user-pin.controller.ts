import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { UserPinService } from './user-pin.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('user-pin')
export class UserPinController {
  constructor(private readonly userPinService: UserPinService) {}

  @Get(':userId')
  async getUserPins(@Param('userId', ParseIntPipe) userId: number) {
    return this.userPinService.getUserPins(userId);
  }

  @Post('buy/:pinId')
  async buyPin(
    @Param('pinId', ParseIntPipe) pinId: number,
    @CurrentUser() user: User,
  ) {
    return this.userPinService.buyPin(pinId, user);
  }
}

import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { UserPinService } from './user-pin.service';
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@Controller('user-pin')
export class UserPinController {
  constructor(private readonly userPinService: UserPinService) {}

  @Public()
  @Get(':userId')
  async getUserPinsById(@Param('userId', ParseIntPipe) userId: number) {
    return this.userPinService.getUserPinsWithMissing(userId);
  }

  @Post('buy/:pinId')
  async buyPin(
    @Param('pinId', ParseIntPipe) pinId: number,
    @CurrentUser() user: User,
  ) {
    return this.userPinService.buyPin(pinId, user);
  }
}

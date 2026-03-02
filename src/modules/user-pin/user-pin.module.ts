import { Module } from '@nestjs/common';
import { UserPinService } from './user-pin.service';
import { UserPinController } from './user-pin.controller';

@Module({
  controllers: [UserPinController],
  providers: [UserPinService],
})
export class UserPinModule {}

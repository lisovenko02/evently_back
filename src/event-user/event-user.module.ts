import { Module } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { EventUserController } from './event-user.controller';

@Module({
  controllers: [EventUserController],
  providers: [EventUserService],
})
export class EventUserModule {}

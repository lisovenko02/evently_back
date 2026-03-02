import { Module } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { EventUserController } from './event-user.controller';
import { ChatModule } from '../chat/chat.module';
import { EventUserHistoryModule } from '../event-user-history/event-user-history.module';
import { EventAccessService } from 'src/common/services/event-access.service';

@Module({
  imports: [ChatModule, EventUserHistoryModule],
  controllers: [EventUserController],
  providers: [EventUserService, EventAccessService],
  exports: [EventUserService],
})
export class EventUserModule {}

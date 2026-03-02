import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ChatService } from '../chat/chat.service';
import { ChatModule } from '../chat/chat.module';
import { EventUserService } from '../event-user/event-user.service';
import { EventUserHistoryModule } from '../event-user-history/event-user-history.module';
import { EventAccessService } from 'src/common/services/event-access.service';
import { EventUserModule } from '../event-user/event-user.module';

@Module({
  imports: [ChatModule, EventUserHistoryModule, EventUserModule],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    ChatService,
    EventUserService,
    EventAccessService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}

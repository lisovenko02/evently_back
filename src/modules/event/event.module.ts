import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { S3Module } from 'src/modules/S3/s3.module';
import { ChatModule } from '../chat/chat.module';
import { BoardService } from '../board/board.service';
import { ApplicationModule } from '../application/application.module';
import { EventAccessService } from 'src/common/services/event-access.service';
import { EventUserHistoryModule } from '../event-user-history/event-user-history.module';

@Module({
  imports: [S3Module, ChatModule, ApplicationModule, EventUserHistoryModule],
  controllers: [EventController],
  providers: [EventService, BoardService, EventAccessService],
})
export class EventModule {}

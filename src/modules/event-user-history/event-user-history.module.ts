import { Module } from '@nestjs/common';
import { EventUserHistoryService } from './event-user-history.service';
import { EventUserHistoryController } from './event-user-history.controller';

@Module({
  controllers: [EventUserHistoryController],
  providers: [EventUserHistoryService, EventUserHistoryController],
  exports: [EventUserHistoryService],
})
export class EventUserHistoryModule {}

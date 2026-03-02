import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';
import { EventUserHistoryService } from './event-user-history.service';
import { GetEventUserHistoryQueryDto } from './dto/get-event-user-history.dto';
import { SearchEventUsersQueryDto } from './dto/search-event-users.dto';
import { GetEventUsersByIdsDto } from './dto/get-event-users-by-ids.dto';

@Controller('event-user-history')
@UseGuards(EventUserGuard)
export class EventUserHistoryController {
  constructor(private readonly historyService: EventUserHistoryService) {}

  @Get('history/:eventId')
  async getEventHistory(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() dto: GetEventUserHistoryQueryDto,
  ) {
    return this.historyService.getEventHistory(dto, eventId);
  }

  @Get('users-by-ids/:eventId')
  async getEventUsersByIds(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() dto: GetEventUsersByIdsDto,
  ) {
    return this.historyService.getEventUsersByIds(dto, eventId);
  }

  @Get('search-users/:eventId')
  async searchEventUsers(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() dto: SearchEventUsersQueryDto,
  ) {
    return this.historyService.searchEventUsers(dto, eventId);
  }

  @Get('metrics/:eventId')
  async getHistoryMetrics(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.historyService.getEventHistoryMetrics(eventId);
  }
}

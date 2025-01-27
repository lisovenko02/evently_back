import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ) {
    return this.eventService.createEvent(createEventDto, user);
  }

  @Get(':id/members')
  @Public()
  async getAllMembers(@Param('id', ParseIntPipe) eventId: number) {
    return this.eventService.getEventMembers(eventId);
  }
}

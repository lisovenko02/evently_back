import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator';
import { User } from '@prisma/client';
import { UpdateApplicationStatusDto } from './dto/update-appl-status.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { GetEventApplicationsQueryDto } from './dto/get-event-applications.dto';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':eventId/create')
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Param('eventId') eventId: number,
    @CurrentUser() user: User,
  ) {
    return this.applicationService.createApplication(
      createApplicationDto,
      eventId,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('invites/:id')
  async getInviteApplicationById(
    @CurrentUser() user: User,
    @Param('id') id: number,
  ) {
    return this.applicationService.getInviteApplicationById(user.id, id);
  }

  @UseGuards(EventUserGuard)
  @Get('event/:eventId')
  async getEventApplications(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() query: GetEventApplicationsQueryDto,
  ) {
    return this.applicationService.getApplicationsByEventId(query, eventId);
  }

  @UseGuards(EventUserGuard)
  @Get('event/metrics/:eventId')
  async getEventApplicationsMetrics(
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.applicationService.getEventApplicationsMetrics(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserApplications(@CurrentUser() user: User) {
    return this.applicationService.getApplicationsByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/:id')
  async resolveApplication(
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser() user: User,
    @Param('id') id: number,
  ) {
    return this.applicationService.resolveApplication(dto, user, id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, User, EventUser } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateEventUserRoleDto } from './dto/update-role-user.dto';
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';
import { CurrentEventUser } from '../auth/decorators/eventUser.decorator';

@Controller('event-user')
export class EventUserController {
  constructor(private readonly eventUserService: EventUserService) {}

  @Get('me/:eventId')
  @UseGuards(JwtAuthGuard)
  async getEventUser(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ) {
    return this.eventUserService.getEventUser(user, eventId);
  }

  @Roles(Role.ORGANIZER)
  @UseGuards(EventUserGuard, RolesGuard)
  @Patch('role')
  async updateRole(
    @Body() updateUserRoleRoleDto: UpdateEventUserRoleDto,
    @CurrentEventUser() currentEventUser: EventUser,
  ) {
    return this.eventUserService.updateRole(
      updateUserRoleRoleDto,
      currentEventUser,
    );
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @Delete('kick/:eventId/:eventUserId')
  @UseGuards(RolesGuard, EventUserGuard)
  async kickUser(
    @Param('eventUserId', ParseIntPipe) eventUserId: number,
    @CurrentEventUser() currentEventUser: EventUser,
    @Body('reason') reason?: string,
  ) {
    return this.eventUserService.kickUser(
      reason,
      eventUserId,
      currentEventUser,
    );
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(RolesGuard, EventUserGuard)
  @Delete('ban/:eventId/:eventUserId')
  banUser(
    @Param('eventUserId', ParseIntPipe) eventUserId: number,
    @CurrentEventUser() currentEventUser: EventUser,
    @Body('reason') reason?: string,
  ) {
    return this.eventUserService.banUser(reason, eventUserId, currentEventUser);
  }

  @Roles(Role.ORGANIZER)
  @UseGuards(RolesGuard, EventUserGuard)
  @Delete('unban/:eventId/:userId')
  unbanUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentEventUser() currentEventUser: EventUser,
    @Body('reason') reason?: string,
  ) {
    return this.eventUserService.unbanUser(userId, currentEventUser, reason);
  }

  // potom check
  @Delete('self-leave/:eventId')
  @UseGuards(EventUserGuard)
  async selfLeave(@CurrentEventUser() eventUser: EventUser) {
    return this.eventUserService.selfLeave(eventUser);
  }
}

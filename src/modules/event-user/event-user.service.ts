import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEventUserRoleDto } from './dto/update-role-user.dto';
import { EventUser, EventUserHistoryStatus, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventUserHistoryService } from '../event-user-history/event-user-history.service';
import { EventAccessService } from 'src/common/services/event-access.service';

@Injectable()
export class EventUserService {
  constructor(
    private prisma: PrismaService,
    private eventUserHistoryService: EventUserHistoryService,
    private eventAccessService: EventAccessService,
  ) {}

  async getEventUser(user: User, eventId: number) {
    const eventUser = await this.prisma.eventUser.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    if (!eventUser) {
      throw new BadRequestException('User not found for the event');
    }

    return eventUser;
  }

  async getUserRole(eventId: number, userId: number) {
    return this.prisma.eventUser.findFirst({
      where: { eventId, userId },
      select: { role: true },
    });
  }

  async updateRole(
    updateUserRoleRoleDto: UpdateEventUserRoleDto,
    currentEventUser: EventUser,
  ) {
    const { eventId, role, eventUserId } = updateUserRoleRoleDto;

    if (currentEventUser.id === eventUserId) {
      throw new ConflictException('You cannot change your role');
    }

    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId: eventId,
        id: eventUserId,
      },
    });

    if (!eventUser) {
      throw new BadRequestException('User not found for the event');
    }

    if (eventUser.role === role) {
      throw new BadRequestException('User already has this role');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedEventUser = await tx.eventUser.update({
        where: { id: eventUser.id },
        data: { role },
      });

      await this.eventUserHistoryService.recordAction(
        {
          eventId,
          userId: eventUser.userId,
          eventUserId: eventUser.id,
          actorUserId: currentEventUser.userId,
          status: EventUserHistoryStatus.ROLE_CHANGED,
          reason: role,
        },
        tx,
      );
      return updatedEventUser;
    });
  }

  async selfLeave(eventUser: EventUser) {
    this.eventAccessService.assertUserRole(
      eventUser,
      [Role.USER, Role.MODERATOR],
      'Leaving the event',
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.eventUser.delete({
        where: { id: eventUser.id },
      });

      await this.eventUserHistoryService.recordAction(
        {
          eventId: eventUser.eventId,
          userId: eventUser.userId,
          eventUserId: eventUser.id,
          status: EventUserHistoryStatus.SELF_LEFT,
        },
        tx,
      );
    });
  }

  async kickUser(
    reason: string,
    eventUserId: number,
    currentEventUser: EventUser,
  ) {
    this.eventAccessService.assertUserRole(
      currentEventUser,
      [Role.ORGANIZER, Role.MODERATOR],
      'Kick user',
    );

    const targetEventUser = await this.prisma.eventUser.findUnique({
      where: { id: eventUserId },
    });

    if (!targetEventUser) {
      throw new NotFoundException('Event participant not found');
    }

    if (currentEventUser.eventId !== targetEventUser.eventId) {
      throw new ForbiddenException('Target user does not belong to this event');
    }

    if (currentEventUser.id === targetEventUser.id) {
      throw new BadRequestException('You cannot kick yourself from the event');
    }

    if (targetEventUser.role === Role.ORGANIZER) {
      throw new ForbiddenException('You cannot kick the event organizer');
    }

    if (
      currentEventUser.role === Role.MODERATOR &&
      targetEventUser.role === Role.MODERATOR
    ) {
      throw new ForbiddenException('Moderators cannot kick other moderators');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.eventUser.delete({
        where: { id: eventUserId },
      });

      await this.eventUserHistoryService.recordAction(
        {
          eventId: targetEventUser.eventId,
          userId: targetEventUser.userId,
          eventUserId,
          status: EventUserHistoryStatus.KICKED,
          actorUserId: currentEventUser.userId,
          reason,
        },
        tx,
      );
    });
  }

  async banUser(
    reason: string,
    eventUserId: number,
    currentEventUser: EventUser,
  ) {
    this.eventAccessService.assertUserRole(
      currentEventUser,
      [Role.ORGANIZER, Role.MODERATOR],
      'Ban user',
    );

    const targetEventUser = await this.prisma.eventUser.findUnique({
      where: { id: eventUserId },
    });

    if (!targetEventUser) {
      throw new NotFoundException('Event participant not found');
    }

    if (currentEventUser.eventId !== targetEventUser.eventId) {
      throw new ForbiddenException('Target user does not belong to this event');
    }

    if (currentEventUser.id === targetEventUser.id) {
      throw new BadRequestException('You cannot ban yourself from the event');
    }

    if (targetEventUser.role === Role.ORGANIZER) {
      throw new ForbiddenException('You cannot ban the event organizer');
    }

    const existingBan = await this.prisma.eventBan.findUnique({
      where: {
        eventId_userId: {
          eventId: targetEventUser.eventId,
          userId: targetEventUser.userId,
        },
      },
    });

    if (existingBan) {
      throw new BadRequestException('User is already banned from this event');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.eventUser.delete({
        where: { id: eventUserId },
      });

      await tx.eventBan.create({
        data: {
          eventId: targetEventUser.eventId,
          userId: targetEventUser.userId,
          bannedById: currentEventUser.userId,
          reason,
        },
      });

      await this.eventUserHistoryService.recordAction(
        {
          eventId: targetEventUser.eventId,
          userId: targetEventUser.userId,
          eventUserId,
          status: EventUserHistoryStatus.BANNED,
          actorUserId: currentEventUser.userId,
          reason,
        },
        tx,
      );
    });
  }

  async unbanUser(userId: number, currentEventUser: EventUser, reason) {
    this.eventAccessService.assertUserRole(
      currentEventUser,
      [Role.ORGANIZER],
      'Unban user',
    );

    const ban = await this.prisma.eventBan.findUnique({
      where: { eventId_userId: { eventId: currentEventUser.eventId, userId } },
    });

    if (!ban) {
      throw new BadRequestException('User is not banned');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.eventBan.delete({
        where: { id: ban.id },
      });

      await this.eventUserHistoryService.recordAction(
        {
          eventId: currentEventUser.eventId,
          userId,
          eventUserId: null,
          actorUserId: currentEventUser.userId,
          status: EventUserHistoryStatus.UNBANNED,
          reason,
        },
        tx,
      );
    });
  }
}

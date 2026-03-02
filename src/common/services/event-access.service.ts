import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EventUser, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventAccessService {
  constructor(private prisma: PrismaService) {}

  async assertUserCanJoinEvent(eventId: number, userId: number) {
    // Check if user is banned in this event
    const ban = await this.prisma.eventBan.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (ban) {
      throw new ForbiddenException('User is banned from this event');
    }

    // Check if user is already a member
    const member = await this.prisma.eventUser.findFirst({
      where: { eventId, userId },
    });

    if (member) {
      throw new BadRequestException('User is already a member of the event');
    }
    // Check if event is exist and not maximum members yet
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new BadRequestException('Event not found');

    if (event.maxParticipants) {
      const currentCount = await this.prisma.eventUser.count({
        where: { eventId },
      });
      if (currentCount >= event.maxParticipants) {
        throw new ForbiddenException('Event is full');
      }
    }

    return event;
  }

  assertUserRole(
    eventUser: EventUser,
    allowedRoles: Role[],
    actionName: string,
  ) {
    if (!allowedRoles.includes(eventUser.role)) {
      throw new ForbiddenException(
        `${actionName} is not allowed for role ${eventUser.role}`,
      );
    }
  }
}

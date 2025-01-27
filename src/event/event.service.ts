import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, user: User) {
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        organizerId: user.id,
      },
    });

    await this.prisma.eventUser.create({
      data: {
        userId: user.id,
        eventId: event.id,
        role: 'ORGANIZER',
        status: 'BANNED',
      },
    });

    return event;
  }

  async getEventMembers(eventId: number) {
    return this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        members: true,
      },
    });
  }
}

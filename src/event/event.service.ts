import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(
    createEventDto: CreateEventDto,
    user: User,
    imageUrl: string,
  ) {
    if (!createEventDto.category) {
      throw new BadRequestException('Category is required');
    }
    console.log(createEventDto);
    console.log('imageUrl', imageUrl);
    if (
      !createEventDto.isOnline &&
      (!createEventDto.city ||
        !createEventDto.country ||
        createEventDto.latitude === undefined ||
        createEventDto.longitude === undefined)
    ) {
      throw new BadRequestException(
        'Location is required for offline events (city, country, latitude, longitude)',
      );
    }

    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description ?? null,
        category: createEventDto.category,
        isOnline: createEventDto.isOnline,
        startTime: createEventDto.startTime ?? null,
        endTime: createEventDto.endTime ?? null,
        image: imageUrl ?? null,
        points: createEventDto.points,
        membersLimit: createEventDto.membersLimit ?? null,
        organizerId: user.id,

        city: createEventDto.isOnline ? null : createEventDto.city,
        country: createEventDto.isOnline ? null : createEventDto.country,
        latitude: createEventDto.isOnline ? null : createEventDto.latitude,
        longitude: createEventDto.isOnline ? null : createEventDto.longitude,
      },
    });

    await this.prisma.eventUser.create({
      data: {
        userId: user.id,
        eventId: event.id,
        role: 'ORGANIZER',
        status: 'ACTIVE',
      },
    });

    return event;
  }

  async getEvents() {
    return this.prisma.event.findMany();
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

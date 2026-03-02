import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventUserHistoryStatus, Prisma, User } from '@prisma/client';
import { ChatService } from '../chat/chat.service';
import { BoardService } from '../board/board.service';
import {
  userMinimalSelect,
  userSelect,
} from 'src/common/prisma-selects/user.select';
import { ApplicationService } from '../application/application.service';
import { EventAccessService } from 'src/common/services/event-access.service';
import { EventUserHistoryService } from '../event-user-history/event-user-history.service';
import { UpdateEventVisibilityDto } from './dto/upda-event-visibility.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly boardService: BoardService,
    private readonly applicationService: ApplicationService,
    private eventUserHistoryService: EventUserHistoryService,
    private eventAccessService: EventAccessService,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    user: User,
    imageUrl: string,
  ) {
    if (
      !createEventDto.isOnline &&
      (!createEventDto.city ||
        !createEventDto.country ||
        !createEventDto.address ||
        createEventDto.latitude === undefined ||
        createEventDto.longitude === undefined)
    ) {
      throw new BadRequestException(
        'Location is required for offline events (city, country, latitude, longitude)',
      );
    }

    const latitude = createEventDto.isOnline
      ? null
      : new Prisma.Decimal(createEventDto.latitude);

    const longitude = createEventDto.isOnline
      ? null
      : new Prisma.Decimal(createEventDto.longitude);

    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description ?? null,
        image: imageUrl ?? null,
        points: createEventDto.points ?? null,
        category: createEventDto.category,
        startTime: createEventDto.startTime ?? null,
        endTime: createEventDto.endTime ?? null,
        maxParticipants: createEventDto.maxParticipants ?? null,
        organizerId: user.id,

        visibility: createEventDto.visibility,
        // status: createEventDto.status ?? EventStatus.OPEN_FOR_APPLICATIONS,

        isOnline: createEventDto.isOnline,

        city: createEventDto.isOnline ? null : createEventDto.city,
        country: createEventDto.isOnline ? null : createEventDto.country,
        address: createEventDto.isOnline ? null : createEventDto.address,
        latitude,
        longitude,
      },
    });

    await this.prisma.eventUser.create({
      data: {
        userId: user.id,
        eventId: event.id,
        role: 'ORGANIZER',
        // *** CHECK AFTER ****
        // status: 'ACTIVE',
      },
    });

    await this.chatService.createGeneralChat(event.id);

    await this.boardService.createBoard(event.id);

    return event;
  }

  async getEventContext(eventId: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        visibility: true,
        organizerId: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const membership = await this.prisma.eventUser.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    const application = await this.prisma.application.findFirst({
      where: {
        eventId,
        applicationStatus: 'PENDING',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const isMember = !!membership;
    const role = membership?.role ?? null;
    const visibility = event.visibility;

    const hasInvited =
      application?.applicationStatus === 'PENDING' &&
      application.type === 'INVITE' &&
      application.receiverId === userId;

    const hasRequested =
      application?.applicationStatus === 'PENDING' &&
      application.type === 'REQUEST' &&
      application.senderId === userId;

    const hasPendingApplication = !!application;

    const permissions = {
      canJoin: visibility === 'OPEN' && !isMember,
      canApply: visibility === 'CLOSED' && !hasPendingApplication && !isMember,
      canEdit: role === 'ORGANIZER',
      canManage: role === 'ORGANIZER' || role === 'MODERATOR',
    };

    return {
      isAuthenticated: true,
      isMember,
      role,
      visibility,
      hasInvited,
      hasRequested,
      applicationId: !isMember && application ? application.id : null,
      permissions,
    };
  }

  async getEvents() {
    return this.prisma.event.findMany();
  }

  async getEventMembers(eventId: number, userSelectFields = userMinimalSelect) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: {
              select: userSelectFields,
            },
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    return event.members;
  }

  async getEventById(eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: userMinimalSelect,
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const location = event.isOnline
      ? null
      : {
          city: event.city,
          country: event.country,
          address: event.address,
          coords: {
            lng: event.longitude,
            lat: event.latitude,
          },
        };

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image,
      visibility: event.visibility,
      category: event.category,
      points: event.points,
      startTime: event.startTime,
      endTime: event.endTime,
      isOnline: event.isOnline,
      location,
      maxParticipants: event.maxParticipants,

      organizer: event.organizer,

      membersCount: event._count.members,
    };
  }

  async getEventsByUser(userId: number) {
    console.log('userId', userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        userEventDetails: {
          include: {
            event: {
              include: {
                _count: {
                  select: { members: true },
                },
              },
            },
          },
        },
      },
    });
    console.log('user', user);
    if (!user) return [];

    return user.userEventDetails.map((detail) => ({
      ...detail.event,
      membersCount: detail.event._count.members,
      role:
        detail.role.charAt(0).toUpperCase() +
        detail.role.slice(1).toLowerCase(),
      // *** CHECK AFTER ****
      // status:
      //   detail.status.charAt(0).toUpperCase() +
      //   detail.status.slice(1).toLowerCase(),
    }));
  }

  async joinOpenEvent(eventId: number, currentUser: User) {
    const event = await this.eventAccessService.assertUserCanJoinEvent(
      eventId,
      currentUser.id,
    );

    if (event.visibility !== 'OPEN') {
      throw new ForbiddenException('Event is not open');
    }

    const eventUser = await this.prisma.$transaction(async (tx) => {
      const createdEventUser = await tx.eventUser.create({
        data: {
          eventId,
          userId: currentUser.id,
          role: 'USER',
        },
      });

      await this.eventUserHistoryService.recordAction(
        {
          eventId,
          userId: currentUser.id,
          eventUserId: createdEventUser.id,
          status: EventUserHistoryStatus.JOINED,
        },
        tx,
      );

      return createdEventUser;
    });

    await this.chatService.addApprovedUserToGeneralChat(eventUser.id);

    return eventUser;
  }

  async updateEventVisibility(dto: UpdateEventVisibilityDto, eventId: number) {
    const { visibility } = dto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    console.log('visibility', visibility);
    if (event.visibility === visibility) {
      throw new ConflictException('Visibility already set');
    }

    // application logic

    const from = event.visibility;
    const to = visibility;

    // CLOSED -> PRIVATE
    if (from === 'CLOSED' && to === 'PRIVATE') {
      await this.applicationService.rejectBySystem({
        eventId,
        reason: 'CHANGED_VISIBILITY',
        where: {
          eventId,
          type: 'REQUEST',
        },
      });
    }

    // CLOSED -> OPEN
    // PRIVATE -> OPEN
    if ((from === 'CLOSED' || from === 'PRIVATE') && to === 'OPEN') {
      await this.applicationService.rejectBySystem({
        eventId,
        reason: 'CHANGED_VISIBILITY',
        where: {
          eventId,
        },
      });
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: { visibility },
    });
  }
}

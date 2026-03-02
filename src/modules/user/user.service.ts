import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { userSelect } from 'src/common/prisma-selects/user.select';
import { SignInDto } from 'src/modules/auth/dto/signIn.dto';
import { SignUpDto } from 'src/modules/auth/dto/signUp.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(signUpDto: SignUpDto) {
    const { password, ...user } = signUpDto;

    const hashedPassword = await hash(password);

    return this.prismaService.user.create({
      data: {
        password: hashedPassword,
        ...user,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOne(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserAvatar(userId: number, avatarUrl: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }
  async updateHashedRefreshToken(userId: number, hashedRt: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRt,
      },
    });
  }

  async getUserProfileById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [organizedEvents, participantEvents, userPins] = await Promise.all([
      this.prismaService.event.findMany({
        where: { organizerId: userId },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
      this.prismaService.eventUser.findMany({
        where: {
          userId: userId,
          role: { not: 'ORGANIZER' },
        },
        include: {
          event: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.userPin.findMany({
        where: { userId: userId },
        include: { pin: true },
      }),
    ]);

    const organizedEventsCount = organizedEvents.length;
    const joinedEventsCount = participantEvents.length;
    const pinsEarned = userPins.length;

    // Розраховуємо статистику категорій
    const allEvents = [
      ...organizedEvents,
      ...participantEvents.map((p) => p.event),
    ];
    const categoryStats = this.calculateCategoryStats(allEvents);

    const formattedOrganizedEvents = organizedEvents.map((event) => ({
      id: event.id,
      title: event.title,
      image: event.image,
      points: event.points || null,
      category: event.category,
      maxParticipants: event.maxParticipants,
      isOnline: event.isOnline,
      membersCount: event._count.members,
      role: 'Organizer',
    }));

    const formattedParticipantEvents = participantEvents.map((detail) => ({
      id: detail.event.id,
      title: detail.event.title,
      image: detail.event.image,
      points: detail.event.points ? Number(detail.event.points) : null,
      category: detail.event.category,
      maxParticipants: detail.event.maxParticipants,
      isOnline: detail.event.isOnline,
      membersCount: detail.event._count.members,
      role:
        detail.role.charAt(0).toUpperCase() +
        detail.role.slice(1).toLowerCase(),
    }));

    const allFormattedEvents = [
      ...formattedOrganizedEvents,
      ...formattedParticipantEvents,
    ];

    return {
      user,
      stats: {
        totalPoints: user.points ?? 0,
        pinsEarned,
        eventsCreated: organizedEventsCount,
        eventsJoined: joinedEventsCount,
      },
      categoryStats,
      events: allFormattedEvents,
    };
  }

  private calculateCategoryStats(events: any[]) {
    if (events.length === 0) return [];

    const categoryCounts = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});

    const totalEvents = events.length;

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count: count as number,
        percentage: Math.round(((count as number) / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }
}

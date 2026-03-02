import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecordEventUserActionInput } from './event-user-history.types';
import { EventUserHistoryStatus, Prisma, PrismaClient } from '@prisma/client';
import { GetEventUserHistoryQueryDto } from './dto/get-event-user-history.dto';
import { SearchEventUsersQueryDto } from './dto/search-event-users.dto';
import { userDefaultSelect } from 'src/common/prisma-selects/user.select';
import { GetEventUsersByIdsDto } from './dto/get-event-users-by-ids.dto';

export type PrismaLike = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class EventUserHistoryService {
  constructor(private prisma: PrismaService) {}

  async getEventHistory(dto: GetEventUserHistoryQueryDto, eventId: number) {
    const { userIds, statuses, from, to, limit = 10, page } = dto;

    const and: Prisma.EventUserHistoryWhereInput[] = [{ eventId }];

    if (statuses?.length) {
      and.push({ status: { in: statuses } });
    }

    if (from || to) {
      and.push({
        createdAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      });
    }

    if (userIds?.length) {
      and.push({
        OR: [{ userId: { in: userIds } }, { actorUserId: { in: userIds } }],
      });
    }

    return this.prisma.eventUserHistory.findMany({
      where: { AND: and },
      orderBy: { id: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: { select: userDefaultSelect },
        actorUser: { select: userDefaultSelect },
      },
    });
  }

  async getEventUsersByIds(dto: GetEventUsersByIdsDto, eventId: number) {
    const { userIds } = dto;
    console.log('userIds', userIds);
    if (!userIds.length) return [];

    const histories = await this.prisma.eventUserHistory.findMany({
      where: {
        eventId,
        OR: [{ userId: { in: userIds } }, { actorUserId: { in: userIds } }],
      },
      select: {
        user: { select: userDefaultSelect },
        actorUser: { select: userDefaultSelect },
      },
    });

    const map = new Map();

    for (const h of histories) {
      if (h.user && userIds.includes(h.user.id)) {
        map.set(h.user.id, h.user);
      }

      if (h.actorUser && userIds.includes(h.actorUser.id)) {
        map.set(h.actorUser.id, h.actorUser);
      }
    }

    return Array.from(map.values());
  }

  async searchEventUsers(dto: SearchEventUsersQueryDto, eventId: number) {
    const { query, limit = 10 } = dto;
    const q = query.toLowerCase();

    const histories = await this.prisma.eventUserHistory.findMany({
      where: {
        eventId,
        OR: [
          {
            user: {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
          {
            actorUser: {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      select: {
        user: { select: userDefaultSelect },
        actorUser: { select: userDefaultSelect },
      },
      take: 100,
    });

    const usersMap = new Map();

    for (const h of histories) {
      if (h.user && matchesQuery(h.user, q)) {
        usersMap.set(h.user.id, h.user);
      }
      if (h.actorUser && matchesQuery(h.actorUser, q)) {
        usersMap.set(h.actorUser.id, h.actorUser);
      }

      if (usersMap.size >= limit) break;
    }
    return Array.from(usersMap.values());
  }

  // async searchEventUsers(dto: SearchEventUsersQueryDto, eventId: number) {
  //   const {
  //     query,
  //     limit = dto.mode === 'FULL' ? 50 : 10,
  //     mode = 'SUGGEST',
  //   } = dto;

  //   const q = query.toLowerCase();

  //   /**
  //    * 1. Беремо історію подій
  //    * 2. ДИВИМОСЬ І user, І actorUser
  //    * 3. Фільтруємо ПО НІКУ / ІМЕНІ
  //    */
  //   const histories = await this.prisma.eventUserHistory.findMany({
  //     where: { eventId },
  //     select: {
  //       user: { select: userDefaultSelect },
  //       actorUser: { select: userDefaultSelect },
  //     },
  //     take: mode === 'FULL' ? 500 : 100,
  //   });

  //   const usersMap = new Map<number, any>();

  //   for (const h of histories) {
  //     if (h.user && matchesQuery(h.user, q)) {
  //       usersMap.set(h.user.id, h.user);
  //     }

  //     if (h.actorUser && matchesQuery(h.actorUser, q)) {
  //       usersMap.set(h.actorUser.id, h.actorUser);
  //     }

  //     if (usersMap.size >= limit) break;
  //   }

  //   return Array.from(usersMap.values());
  // }

  async getEventHistoryMetrics(eventId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId },
    });

    const byStatus = await this.prisma.eventUserHistory.groupBy({
      by: ['status'],
      where: { eventId },
      _count: { _all: true },
    });

    const moderationCount = await this.prisma.eventUserHistory.count({
      where: {
        eventId,
        actorUserId: { not: null, notIn: [event.organizerId] },
      },
    });

    const historiesWithActor = await this.prisma.eventUserHistory.findMany({
      where: {
        eventId,
        actorUserId: { not: null, notIn: [event.organizerId] },
      },
      select: {
        actorUserId: true,
        actorUser: { select: { username: true, avatar: true } },
      },
    });

    const actorCounts: Record<number, number> = {};

    historiesWithActor.forEach((h) => {
      if (h.actorUserId)
        actorCounts[h.actorUserId] = (actorCounts[h.actorUserId] || 0) + 1;
    });

    const topModeratorId = Object.entries(actorCounts)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .shift()?.[0];

    const topModeratorData = historiesWithActor.find(
      (h) => h.actorUserId === Number(topModeratorId),
    );

    const topModerator = topModeratorData
      ? {
          userId: topModeratorData.actorUserId,
          username: topModeratorData.actorUser.username,
          avatar: topModeratorData.actorUser.avatar,
          actions: actorCounts[Number(topModeratorId)],
        }
      : null;

    const statusMap = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count._all]),
    );

    return {
      activity: {
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
        joined: statusMap.JOINED ?? 0,
        self_left: statusMap.SELF_LEFT ?? 0,
        kicked: statusMap.KICKED ?? 0,
        banned: statusMap.BANNED ?? 0,
        unbanned: statusMap.UNBANNED ?? 0,
        role_changed: statusMap.ROLE_CHANGED ?? 0,
      },

      moderation: {
        totalActions: moderationCount,
        topModerator,
      },
    };
  }

  async recordAction(
    params: RecordEventUserActionInput,
    prisma: PrismaLike = this.prisma,
  ) {
    const { eventId, eventUserId, status, userId, reason, actorUserId } =
      params;

    const lastAction = await prisma.eventUserHistory.findFirst({
      where: { eventId, userId },
      orderBy: { createdAt: 'desc' },
    });

    if (lastAction) {
      this.validateActionTransition(lastAction.status, status);
    }

    return prisma.eventUserHistory.create({
      data: {
        eventId,
        userId,
        eventUserId,
        status,
        reason,
        actorUserId,
      },
    });
  }

  private validateActionTransition(
    lastStatus: EventUserHistoryStatus,
    nextStatus: EventUserHistoryStatus,
  ) {
    if (
      lastStatus === nextStatus &&
      nextStatus !== EventUserHistoryStatus.ROLE_CHANGED
    ) {
      throw new BadRequestException(
        `Action "${nextStatus}" is already applied`,
      );
    }
  }
}
function matchesQuery(user: any, q: string) {
  return (
    user.username?.toLowerCase().includes(q) ||
    user.firstName?.toLowerCase().includes(q) ||
    user.lastName?.toLowerCase().includes(q)
  );
}

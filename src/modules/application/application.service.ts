import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event, Prisma, User } from '@prisma/client';
import { ChatService } from '../chat/chat.service';
import { EventUserService } from '../event-user/event-user.service';
import { EventUserHistoryService } from '../event-user-history/event-user-history.service';
import { EventAccessService } from 'src/common/services/event-access.service';
import { SystemRejectContext } from './types/application.types';
import { GetEventApplicationsQueryDto } from './dto/get-event-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-appl-status.dto';
import { userMinimalSelect } from 'src/common/prisma-selects/user.select';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
    private eventUserService: EventUserService,
    private eventUserHistoryService: EventUserHistoryService,
    private eventAccessService: EventAccessService,
  ) {}
  // NEW
  async createApplication(
    dto: CreateApplicationDto,
    eventId: number,
    user: User,
  ) {
    const { type } = dto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new BadRequestException('Event not found');

    if (event.visibility === 'OPEN') {
      throw new BadRequestException('Open events do not require applications');
    }

    if (event.visibility === 'PRIVATE' && type !== 'INVITE') {
      throw new BadRequestException(
        'Private events accept only INVITE applications',
      );
    }

    if (type === 'INVITE') {
      return this.handleInviteApplication(dto, user, event, eventId);
    } else if (type === 'REQUEST') {
      return this.handleRequestApplication(dto, user, eventId);
    }

    throw new BadRequestException('Invalid application type');
  }

  // UNIVERSAL VALIDATION LOGIC
  private async validateBeforeCreate(eventId: number, targetUserId: number) {
    // Check if user is banned in this event
    await this.eventAccessService.assertUserCanJoinEvent(eventId, targetUserId);

    // Check for existing PENDING application of ANY type (REQUEST or INVITE)
    const existingPending = await this.prisma.application.findFirst({
      where: {
        eventId,
        applicationStatus: 'PENDING',
        OR: [
          {
            // User already sent a REQUEST
            type: 'REQUEST',
            senderId: targetUserId,
          },
          {
            // User was already INVITED
            type: 'INVITE',
            receiverId: targetUserId,
          },
        ],
      },
    });

    if (existingPending) {
      throw new BadRequestException('User already has a pending application');
    }
  }

  // REQUEST LOGIC
  private async handleRequestApplication(
    dto: CreateApplicationDto,
    user: User,
    eventId: number,
  ) {
    const { comment } = dto;

    await this.validateBeforeCreate(eventId, user.id);

    const application = await this.prisma.application.create({
      data: {
        eventId,
        type: 'REQUEST',
        senderId: user.id,
        senderComment: comment,
        applicationStatus: 'PENDING',
      },
    });

    return {
      id: application.id,
      eventId: application.eventId,
      senderId: application.senderId,
      receiverId: application.receiverId,
      senderComment: application.senderComment,
      type: application.type,
      applicationStatus: 'PENDING',
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  // INVITE LOGIC
  private async handleInviteApplication(
    dto: CreateApplicationDto,
    user: User,
    event: Event,
    eventId: number,
  ) {
    const { receiverId, comment } = dto;

    if (!receiverId)
      throw new BadRequestException('receiverId is required for INVITE');

    const targetUser = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!targetUser) throw new BadRequestException('User not found');

    // Check role of current user
    const membership = await this.eventUserService.getUserRole(
      event.id,
      user.id,
    );
    if (!membership || !['ORGANIZER', 'MODERATOR'].includes(membership.role)) {
      throw new ForbiddenException('No permission');
    }

    // Validate the target user
    await this.validateBeforeCreate(eventId, receiverId);

    const application = await this.prisma.application.create({
      data: {
        eventId,
        type: 'INVITE',
        senderId: user.id,
        receiverId,
        senderComment: comment,
        applicationStatus: 'PENDING',
      },
    });

    return {
      id: application.id,
      eventId: application.eventId,
      senderId: application.senderId,
      senderComment: application.senderComment,
      receiverId: application.receiverId,
      type: application.type,
      applicationStatus: 'PENDING',
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  async getInviteApplicationById(userId: number, id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        sender: {
          select: userMinimalSelect,
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.type !== 'INVITE') {
      throw new BadRequestException('Allow only invite applications');
    }

    if (application.receiverId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: application.id,
      eventId: application.eventId,
      status: application.applicationStatus,
      senderComment: application.senderComment,
      sender: application.sender,
      createdAt: application.createdAt,
    };
  }

  async getApplicationsByEventId(
    query: GetEventApplicationsQueryDto,
    eventId: number,
  ) {
    const { view, from, to, limit = 10, cursor } = query;

    // ---------------------------
    // BASE WHERE
    // ---------------------------

    const baseWhere: Prisma.ApplicationWhereInput = { eventId };

    // ---------------------------
    // WHERE (VIEW FILTER)
    // ---------------------------

    const where: Prisma.ApplicationWhereInput = { ...baseWhere };

    switch (view) {
      case 'NEEDS_ACTION':
        where.type = 'REQUEST';
        where.applicationStatus = 'PENDING';
        break;

      case 'INVITES':
        where.type = 'INVITE';
        where.applicationStatus = 'PENDING';
        break;

      case 'RESOLVED':
        where.applicationStatus = { in: ['ACCEPTED', 'REJECTED'] };
        break;

      case 'ALL':
        break;
    }

    // ---------------------------
    // DATE FILTER
    // ---------------------------

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    // ---------------------------
    // ORDER BY
    // ---------------------------

    let orderBy: Prisma.ApplicationOrderByWithRelationInput[] = [];

    if (view === 'RESOLVED' || view === 'ALL') {
      orderBy = [{ updatedAt: 'desc' }, { id: 'desc' }];
    } else {
      orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
    }

    // ---------------------------
    // COUNTS (Metrics)
    // ---------------------------

    const [requestCount, inviteCount, resolvedCount, allCount] =
      await Promise.all([
        this.prisma.application.count({
          where: {
            ...baseWhere,
            type: 'REQUEST',
            applicationStatus: 'PENDING',
          },
        }),
        this.prisma.application.count({
          where: {
            ...baseWhere,
            type: 'INVITE',
            applicationStatus: 'PENDING',
          },
        }),
        this.prisma.application.count({
          where: {
            ...baseWhere,
            applicationStatus: { in: ['ACCEPTED', 'REJECTED'] },
          },
        }),
        this.prisma.application.count({
          where: baseWhere,
        }),
      ]);

    const activeCount = requestCount + inviteCount;

    const counts = {
      active: activeCount,
      request: requestCount,
      invite: inviteCount,
      resolved: resolvedCount,
      all: allCount,
    };

    // ---------------------------
    // QUERY (🔴 limit + 1)
    // ---------------------------

    const applications = await this.prisma.application.findMany({
      where,
      orderBy,
      take: limit + 1, //
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        sender: { select: userMinimalSelect },
        receiver: { select: userMinimalSelect },
        decisionBy: { select: userMinimalSelect },
      },
    });

    // ---------------------------
    // PAGINATION
    // ---------------------------

    let nextCursor: number | null = null;

    if (applications.length > limit) {
      const nextItem = applications.pop();
      nextCursor = nextItem!.id;
    }

    return {
      applications,
      counts,
      nextCursor,
    };
  }

  async getEventApplicationsMetrics(eventId: number) {
    const totalApproverActions = await this.prisma.application.count({
      where: {
        eventId,
        type: 'REQUEST',
        applicationStatus: { in: ['ACCEPTED', 'REJECTED'] },
        decisionById: { not: null },
      },
    });

    const topApproverRaw = await this.prisma.application.groupBy({
      by: ['decisionById'],
      where: {
        eventId,
        type: 'REQUEST',
        applicationStatus: { in: ['ACCEPTED', 'REJECTED'] },
        decisionById: { not: null },
      },
      _count: { decisionById: true },
      orderBy: { _count: { decisionById: 'desc' } },
      take: 1,
    });

    let topApprover = null;

    if (topApproverRaw.length) {
      const approverId = topApproverRaw[0].decisionById!;
      const actions = topApproverRaw[0]._count.decisionById;

      const user = await this.prisma.user.findUnique({
        where: { id: approverId },
        select: userMinimalSelect,
      });

      if (user) {
        topApprover = {
          user,
          actions,
          totalActions: totalApproverActions,
        };
      }
    }

    const totalInviterActions = await this.prisma.application.count({
      where: {
        eventId,
        type: 'INVITE',
      },
    });

    const bestInviterRaw = await this.prisma.application.groupBy({
      by: ['senderId'],
      where: {
        eventId,
        type: 'INVITE',
      },
      _count: { senderId: true },
      orderBy: { _count: { senderId: 'desc' } },
      take: 1,
    });

    let bestInviter = null;

    if (bestInviterRaw.length) {
      const inviterId = bestInviterRaw[0].senderId;
      const actions = bestInviterRaw[0]._count.senderId;

      const user = await this.prisma.user.findUnique({
        where: { id: inviterId },
        select: userMinimalSelect,
      });

      if (user) {
        bestInviter = {
          user,
          actions,
          totalActions: totalInviterActions,
        };
      }
    }

    return {
      topApprover,
      bestInviter,
    };
  }

  async getApplicationsByUserId(userId: number) {
    return this.prisma.application.findMany({
      where: {
        senderId: userId,
      },
      include: {
        event: true,
      },
    });
  }

  async resolveApplication(
    dto: UpdateApplicationStatusDto,
    user: User,
    id: number,
  ) {
    const { decisionByComment, status } = dto;
    const application = await this.getPendingApplication(id);

    await this.assertCanResolve(application, user);

    let updatedApplication;

    if (status === 'ACCEPTED') {
      const targetUserId =
        application.type === 'REQUEST'
          ? application.senderId
          : application.receiverId!;

      await this.eventAccessService.assertUserCanJoinEvent(
        application.eventId,
        targetUserId,
      );

      await this.prisma.$transaction(async (tx) => {
        updatedApplication = await tx.application.update({
          where: { id: id },
          data: {
            decisionById: user.id,
            applicationStatus: status,
            decisionByComment,
            rejectSource: 'STAFF',
          },
        });

        const newEventUser = await tx.eventUser.create({
          data: {
            userId: targetUserId,
            eventId: application.eventId,
            role: 'USER',
          },
        });

        await this.eventUserHistoryService.recordAction(
          {
            eventId: application.eventId,
            userId: targetUserId,
            eventUserId: newEventUser.id,
            actorUserId: user.id,
            status: 'JOINED',
          },
          tx,
        );

        await this.chatService.addApprovedUserToGeneralChat(
          newEventUser.id,
          tx,
        );
      });
    } else {
      updatedApplication = await this.prisma.application.update({
        where: { id: id },
        data: {
          decisionById: user.id,
          applicationStatus: status,
          decisionByComment,
          rejectSource: application.type === 'INVITE' ? 'APPLICANT' : 'STAFF',
        },
      });
    }

    return updatedApplication;
  }

  async rejectBySystem(context: SystemRejectContext) {
    return this.prisma.application.updateMany({
      where: {
        ...context.where,
        applicationStatus: 'PENDING',
      },
      data: {
        applicationStatus: 'REJECTED',
        rejectSource: 'SYSTEM',
        systemRejectReason: context.reason,
      },
    });
  }

  private async getPendingApplication(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id: id },
      include: { event: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (application.applicationStatus !== 'PENDING') {
      throw new BadRequestException(
        `Application already processed (${application.applicationStatus})`,
      );
    }

    return application;
  }

  private async assertCanResolve(application, user) {
    if (application.type === 'REQUEST') {
      const role = await this.eventUserService.getUserRole(
        application.eventId,
        user.id,
      );
      if (!role || !['ORGANIZER', 'MODERATOR'].includes(role.role)) {
        throw new ForbiddenException('No permission to approve REQUEST');
      }
    }
    if (application.type === 'INVITE') {
      if (application.receiverId !== user.id) {
        throw new ForbiddenException(
          'Only invited user can accept this INVITE',
        );
      }
    }
  }

  private async handleAccepted(application, user) {
    const targetUserId =
      application.type === 'REQUEST'
        ? application.senderId
        : application.receiverId!;

    await this.eventAccessService.assertUserCanJoinEvent(
      application.eventId,
      targetUserId,
    );

    const newEventUser = await this.prisma.eventUser.create({
      data: {
        userId: targetUserId,
        eventId: application.eventId,
        role: 'USER',
      },
    });

    const history = await this.eventUserHistoryService.recordAction({
      eventId: application.eventId,
      userId: targetUserId,
      eventUserId: newEventUser.id,
      actorUserId: user.id,
      status: 'JOINED',
    });
    console.log('history', history);
    await this.chatService.addApprovedUserToGeneralChat(newEventUser.id);
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventUser } from '@prisma/client';
import { UpdateTaskDetailsDto } from './dto/update-details.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateTaskColumnDto } from './dto/update-status.dto';
import { userSelect } from 'src/common/prisma-selects/user.select';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(dto: CreateTaskDto, eventUser: EventUser) {
    const column = await this.prisma.taskColumn.findUnique({
      where: { id: dto.columnId },
      include: {
        board: true,
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    if (column.board.eventId !== eventUser.eventId) {
      throw new BadRequestException('Column does not belong to your event');
    }

    return this.prisma.task.create({
      data: {
        ...dto,
        creatorId: eventUser.id,
      },
    });
  }

  async updateDetails(dto: UpdateTaskDetailsDto, taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId },
      data: { ...dto },
    });
  }

  async moveTask(
    dto: UpdateTaskColumnDto,
    taskId: number,
    eventUser: EventUser,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: true,
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    const isAssignedToUser = task.assignees.some(
      (assignment) => assignment.assigneeId === eventUser.id,
    );

    const hasPermissionByRole = ['MODERATOR', 'ORGANIZER'].includes(
      eventUser.role,
    );

    if (!isAssignedToUser && !hasPermissionByRole) {
      throw new ForbiddenException('You are not allowed to move this task');
    }

    const newColumn = await this.prisma.taskColumn.findUnique({
      where: { id: dto.newColumnId },
      include: { board: true },
    });

    if (!newColumn) throw new NotFoundException('Target column not found ');

    if (task.column.board.eventId !== newColumn.board.eventId) {
      throw new BadRequestException(
        'Target column does not belong to the same event',
      );
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: dto.newColumnId,
      },
    });
  }

  async assignTask(dto: AssignTaskDto, taskId: number, eventUser: EventUser) {
    if (!['MODERATOR', 'ORGANIZER'].includes(eventUser.role)) {
      throw new ForbiddenException('You are not allowed to assign tasks');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.column.board.eventId !== eventUser.eventId) {
      throw new ForbiddenException(
        'You can only assign tasks within your event',
      );
    }

    const eventUserRecord = await this.prisma.eventUser.findFirst({
      where: {
        userId: dto.assigneeId,
        eventId: eventUser.eventId,
      },
    });

    if (!eventUserRecord) {
      throw new BadRequestException('User is not a member of this event');
    }

    const alreadyAssigned = await this.prisma.taskAssignee.findFirst({
      where: {
        taskId,
        assigneeId: dto.assigneeId,
      },
    });

    if (alreadyAssigned) {
      throw new BadRequestException('User is already assigned to this task');
    }

    const assignment = await this.prisma.taskAssignee.create({
      data: {
        assigneeId: eventUserRecord.id,
        assignedById: eventUser.id,
        taskId,
      },
      include: {
        assignee: {
          include: { user: { select: userSelect } },
        },
        assignedBy: {
          include: { user: { select: userSelect } },
        },
      },
    });

    return assignment;
  }

  async selfAssign(taskId: number, eventUser: EventUser) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.column.board.eventId !== eventUser.eventId) {
      throw new ForbiddenException(
        'You can only assign tasks within your event',
      );
    }

    const alreadyAssigned = await this.prisma.taskAssignee.findFirst({
      where: {
        taskId,
        assigneeId: eventUser.id,
      },
    });

    if (alreadyAssigned) {
      throw new BadRequestException('You are already assigned to this task');
    }

    const assignment = await this.prisma.taskAssignee.create({
      data: {
        assigneeId: eventUser.id,
        taskId,
        assignedById: null,
      },
      include: {
        assignee: {
          include: { user: { select: userSelect } },
        },
        assignedBy: {
          include: { user: { select: userSelect } },
        },
      },
    });

    return assignment;
  }

  async deleteTask(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  // Comments

  async addComment(taskId: number, eventUser: EventUser, content: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { board: true } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (eventUser.eventId !== task.column.board.eventId) {
      throw new ForbiddenException('You cannot comment on this task');
    }

    return this.prisma.taskComment.create({
      data: {
        content,
        taskId,
        authorId: eventUser.id,
      },
      include: {
        author: {
          include: {
            user: { select: userSelect },
          },
        },
      },
    });
  }

  getComments(taskId: number) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        author: {
          include: { user: { select: userSelect } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteComment(commentId: number, eventUser: EventUser) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        author: true,
        task: {
          include: {
            column: {
              include: {
                board: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.authorId === eventUser.id;
    const isModeratorOrOrganizer = ['MODERATOR', 'ORGANIZER'].includes(
      comment.author.role,
    );

    if (!isAuthor && !isModeratorOrOrganizer) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    return this.prisma.taskComment.delete({
      where: { id: commentId },
    });
  }
}

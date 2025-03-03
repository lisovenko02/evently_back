import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateTaskDetailsDto } from './dto/update-details.dto';
import { UpdateTaskStatusDto } from './dto/update-status.dto';
import { AssignTaskDto } from './dto/update-assign.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(createTaskDto: CreateTaskDto, user: User) {
    const { eventId, assigneeId } = createTaskDto;

    const userInEvent = await this.prisma.eventUser.findFirst({
      where: { eventId, userId: user.id },
    });

    if (!userInEvent) {
      throw new ForbiddenException('You are not a member of this event');
    }

    let assignedById = null;
    if (assigneeId) {
      const assigneeInEvent = await this.prisma.eventUser.findFirst({
        where: { eventId, userId: assigneeId },
      });

      if (!assigneeInEvent) {
        throw new BadRequestException('Assignee is not a member of this event');
      }

      assignedById = userInEvent.id;
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description || null,
        priority: createTaskDto.priority,
        points: createTaskDto.points ?? 0,
        status: createTaskDto.status,
        eventId,
        creatorId: userInEvent.id,
        assigneeId: assigneeId || null,
        assignedById: assignedById || null,
      },
    });
  }

  async getAllEventTasks(eventId: number, user: User) {
    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId,
        userId: user.id,
      },
    });

    if (!eventUser) {
      throw new ForbiddenException('User is not a member of this event');
    }

    return this.prisma.task.findMany({
      where: { eventId },
    });
  }

  async updateTaskInfo(id: number, updateTaskDetailsDto: UpdateTaskDetailsDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.eventId !== updateTaskDetailsDto.eventId) {
      throw new ForbiddenException('User does not have access to this event');
    }

    return this.prisma.task.update({
      where: { id },
      data: { ...updateTaskDetailsDto },
    });
  }

  async updateTaskStatus(
    id: number,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User,
  ) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId: task.eventId,
        userId: user.id,
      },
    });

    if (!eventUser) {
      throw new ForbiddenException('User is not a member of this event');
    }

    if (task.assigneeId !== eventUser.id) {
      throw new ForbiddenException('You are not the assignee of this task');
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: updateTaskStatusDto.status },
    });
  }

  async assignTask(id: number, assignTaskDto: AssignTaskDto, user: User) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    const userInEvent = await this.prisma.eventUser.findFirst({
      where: { eventId: assignTaskDto.eventId, userId: user.id },
    });

    if (!userInEvent) {
      throw new ForbiddenException('You are not a member of this event');
    }

    const assignee = await this.prisma.eventUser.findFirst({
      where: { eventId: task.eventId, userId: assignTaskDto.assigneeId },
    });

    if (!assignee) {
      throw new BadRequestException('Assignee is not a member of this event');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        assigneeId: assignTaskDto.assigneeId,
        assignedById: userInEvent.id,
      },
    });
  }

  async selfAssignTask(id: number, user: User) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    const eventUser = await this.prisma.eventUser.findFirst({
      where: { eventId: task.eventId, userId: user.id },
    });

    if (!eventUser) {
      throw new ForbiddenException('You are not a member of this event');
    }

    if (task.assigneeId) {
      throw new BadRequestException('Task is already assigned');
    }

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId: user.id, assignedById: null },
    });
  }

  async deleteTask(id: number, eventId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.eventId !== eventId) {
      throw new ForbiddenException(
        'Task does not belong to the specified event',
      );
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }
}

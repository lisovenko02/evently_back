import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDetailsDto } from './dto/update-details.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateTaskStatusDto } from './dto/update-status.dto';
import { AssignTaskDto } from './dto/update-assign.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create')
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.createTask(createTaskDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':eventId')
  async getAllEventTasks(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ) {
    return this.taskService.getAllEventTasks(eventId, user);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async updateTaskInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDetailsDto: UpdateTaskDetailsDto,
  ) {
    return this.taskService.updateTaskInfo(id, updateTaskDetailsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.updateTaskStatus(id, updateTaskStatusDto, user);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/assign')
  async assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.assignTask(id, assignTaskDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/self-assign')
  async selfAssignTask(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.taskService.selfAssignTask(id, user);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/event/:eventId')
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.taskService.deleteTask(id, eventId);
  }
}

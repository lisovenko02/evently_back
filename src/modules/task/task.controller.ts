import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDetailsDto } from './dto/update-details.dto';
import { EventUser, Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AssignTaskDto } from './dto/assign-task.dto';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';
import { CurrentEventUser } from '../auth/decorators/eventUser.decorator';
import { UpdateTaskColumnDto } from './dto/update-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, EventUserGuard)
  @Roles(Role.MODERATOR, Role.ORGANIZER)
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentEventUser() eventUser: EventUser) {
    return this.taskService.createTask(dto, eventUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @Patch(':taskId/details')
  updateDetails(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDetailsDto,
  ) {
    return this.taskService.updateDetails(dto, taskId);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Patch(':taskId/move')
  moveTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskColumnDto,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.taskService.moveTask(dto, taskId, eventUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, EventUserGuard)
  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @Patch(':taskId/assign')
  assignTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: AssignTaskDto,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.taskService.assignTask(dto, taskId, eventUser);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Patch(':taskId/self-assign')
  selfAssign(
    @Param('taskId', ParseIntPipe) taskId: number,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.taskService.selfAssign(taskId, eventUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @Delete(':taskId')
  deleteTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.taskService.deleteTask(taskId);
  }

  // COMMENTS

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Post(':taskId/comments')
  addComment(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.taskService.addComment(taskId, eventUser, dto.content);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':taskId/comments')
  getComments(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.taskService.getComments(taskId);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Delete('comments/:commentId')
  deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.taskService.deleteComment(commentId, eventUser);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':boardId')
  async createColumn(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnService.createColumn(boardId, dto);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/title/:columnId')
  async updateColumnTitle(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnService.updateColumnTitle(columnId, dto.title);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('reorder')
  async reorderColumns(@Body() dto: ReorderColumnsDto) {
    return this.columnService.reorderColumns(dto);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':columnId')
  async deleteColumn(@Param('columnId', ParseIntPipe) columnId: number) {
    return this.columnService.deleteColumn(columnId);
  }
}

import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BoardService } from './board.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Post(':eventId')
  async createBoard(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.boardService.createBoard(eventId);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Get(':eventId')
  getEventBoard(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.boardService.getEventBoard(eventId);
  }
}

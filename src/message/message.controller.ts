import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Role, User } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { DeleteMessageStatusDto } from './dto/delete-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('create')
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messageService.createMessage(createMessageDto, user);
  }

  @Patch(':id')
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messageService.updateMessage(id, updateMessageDto, user);
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteMessageStatusDto: DeleteMessageStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.messageService.deleteMessage(id, deleteMessageStatusDto, user);
  }
}

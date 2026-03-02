import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { CurrentEventUser } from '../auth/decorators/eventUser.decorator';
import { EventUser } from '@prisma/client';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/configs/multer.config';
import { S3Service } from '../S3/s3.service';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Post('private')
  createPrivateChat(
    @Body() createPrivateChatDto: CreatePrivateChatDto,
    @CurrentEventUser() sender: EventUser,
  ) {
    return this.chatService.createPrivateChat(sender.id, createPrivateChatDto);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Post('group')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async createGroupChat(
    @UploadedFile() file: Express.Multer.File,
    @Body() createGroupChatDto: CreateGroupChatDto,
    @CurrentEventUser() creator: EventUser,
  ) {
    let imageUrl;

    if (file) {
      try {
        const { fileUrl } = await this.s3Service.uploadFile(file, creator.id);

        imageUrl = fileUrl;
      } catch {
        throw new InternalServerErrorException('Failed to upload image');
      }
    }

    return this.chatService.createGroupChat(
      creator.id,
      createGroupChatDto,
      imageUrl,
    );
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Get('my-chats/:eventId')
  getMyChats(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.chatService.getUserChats(eventUser);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Get(':chatId/:eventId')
  getChatDetails(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentEventUser()
    eventUser: EventUser,
  ) {
    return this.chatService.getChatDetails(chatId, eventUser.id);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Patch(':chatId/name')
  updateGroupName(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentEventUser() eventUser: EventUser,
    @Body() dto: UpdateGroupChatDto,
  ) {
    return this.chatService.updateGroupName(chatId, eventUser, dto.name);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Patch(':chatId/image')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async updateGroupImage(
    @Param('chatId', ParseIntPipe) chatId: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    if (!file) throw new BadRequestException('Image is required');

    try {
      const { fileUrl } = await this.s3Service.uploadFile(file, eventUser.id);
      return this.chatService.updateGroupImage(chatId, eventUser, fileUrl);
    } catch {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Patch('addMember/:chatId')
  addParticipantToChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentEventUser() eventUser: EventUser,
    @Body() dto: AddParticipantDto,
  ) {
    return this.chatService.addParticipantToGroupChat(
      chatId,
      dto.eventUserId,
      eventUser,
    );
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Delete(':chatId/:eventUserId')
  kickParticipantFromChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('eventUserId', ParseIntPipe) eventUserId: number,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.chatService.kickParticipantFromGroupChat(
      chatId,
      eventUserId,
      eventUser,
    );
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Delete(':chatId')
  deleteGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.chatService.deleteGroupChat(chatId, eventUser);
  }
}

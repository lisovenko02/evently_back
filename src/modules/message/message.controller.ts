import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';
import { CurrentEventUser } from '../auth/decorators/eventUser.decorator';
import { EventUser } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadMessageFileDto } from './dto/upload-message-file.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Get(':chatId')
  async getMessages(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.messageService.getMessages(chatId, eventUser);
  }

  @UseGuards(JwtAuthGuard, EventUserGuard)
  @Post('upload-files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMessageFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMessageFileDto,
    @CurrentEventUser() eventUser: EventUser,
  ) {
    return this.messageService.uploadMessageFiles(files, dto, eventUser);
  }
}

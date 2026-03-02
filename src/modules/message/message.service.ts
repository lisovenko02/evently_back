import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from '../S3/s3.service';
import { EventUser } from '@prisma/client';
import { UploadMessageFileDto } from './dto/upload-message-file.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { userSelect } from 'src/common/prisma-selects/user.select';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, senderId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: createMessageDto.chatId },
      select: { eventId: true },
    });

    if (!chat || chat.eventId !== createMessageDto.eventId) {
      throw new ForbiddenException('Invalid chat for this event');
    }

    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        userId: senderId,
        eventId: createMessageDto.eventId,
      },
    });

    if (!eventUser) {
      throw new ForbiddenException('User is not part of the event');
    }

    if (createMessageDto.attachments.length > 10) {
      throw new ForbiddenException('Too many attachments');
    }

    const isParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId: createMessageDto.chatId,
        eventUserId: eventUser.id,
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    let attachmentsData = [];

    if (
      createMessageDto.attachments &&
      createMessageDto.attachments.length > 0
    ) {
      attachmentsData = createMessageDto.attachments.map((file) => ({
        fileUrl: file.fileUrl,
        fileName: file.fileName,
      }));
    }

    const message = await this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        chatId: createMessageDto.chatId,
        senderId: senderId,
        attachments: {
          create: attachmentsData,
        },
      },
      include: {
        attachments: true,
        sender: {
          select: {
            id: true,
            user: { select: userSelect },
          },
        },
      },
    });

    await this.prisma.chat.update({
      where: { id: createMessageDto.chatId },
      data: {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
      },
    });
    return message;
  }

  async uploadMessageFiles(
    files: Express.Multer.File[],
    dto: UploadMessageFileDto,
    eventUser: EventUser,
  ) {
    const isParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId: dto.chatId,
        eventUserId: eventUser.id,
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => this.s3Service.uploadFile(file, eventUser.id)),
    );

    return { attachments: uploadedFiles };
  }

  async getMessages(chatId: number, eventUser: EventUser) {
    const isParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId,
        eventUserId: eventUser.id,
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    return this.prisma.message.findMany({
      where: { chatId },
      include: {
        attachments: true,
        sender: {
          select: {
            id: true,
            user: { select: userSelect },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateMessageDto } from './dto/update-message.dto';
import { DeleteMessageStatusDto } from './dto/delete-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto, user: User) {
    const { eventId, receiverEventId, content, isGroupMessage } =
      createMessageDto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const userInEvent = await this.prisma.eventUser.findFirst({
      where: { eventId, userId: user.id },
    });
    if (!userInEvent) {
      throw new ForbiddenException('User is not a member of this event');
    }

    let receiverEventUser = null;
    if (!isGroupMessage) {
      receiverEventUser = await this.prisma.eventUser.findFirst({
        where: {
          id: receiverEventId,
          eventId,
        },
      });

      if (!receiverEventUser) {
        throw new ForbiddenException('Receiver is not part of this event');
      }
    }

    return this.prisma.message.create({
      data: {
        content,
        senderId: user.id, // потом може змінить
        eventId,
        isGroupMessage,
        receiverId: isGroupMessage ? null : receiverEventUser.id,
      },
    });
  }

  async updateMessage(
    id: number,
    updateMessageDto: UpdateMessageDto,
    user: User,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const userInEvent = await this.prisma.eventUser.findFirst({
      where: { eventId: message.eventId, userId: user.id },
    });
    if (!userInEvent) {
      throw new ForbiddenException('User is not a member of this event');
    }

    if (message.senderId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this message',
      );
    }

    return this.prisma.message.update({
      where: { id },
      data: {
        content: updateMessageDto.content,
      },
    });
  }

  async deleteMessage(
    id: number,
    deleteMessageStatusDto: DeleteMessageStatusDto,
    user: User,
  ) {
    const { eventId } = deleteMessageStatusDto;

    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.eventId !== eventId) {
      throw new ForbiddenException(
        'Message does not belong to the specified event',
      );
    }

    const userInEvent = await this.prisma.eventUser.findFirst({
      where: { eventId, userId: user.id },
    });

    if (!userInEvent) {
      throw new ForbiddenException('User is not a member of this event');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }
}

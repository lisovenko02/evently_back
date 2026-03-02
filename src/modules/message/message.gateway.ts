import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/websocket/ws-jwt-guard';
import { ForbiddenException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { userSelect } from 'src/common/prisma-selects/user.select';

export interface SocketWithUser extends Socket {
  user: {
    sub: number;
    iat: number;
    exp: number;
  };
}

@WebSocketGateway({ cors: true })
@UseGuards(WsJwtGuard)
export class MessageGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly prisma: PrismaService,
  ) {}

  @SubscribeMessage('createMessage')
  async handleMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    try {
      const user = client.user;

      const message = await this.messageService.createMessage(dto, user.sub);
      this.server.to(`chat-${dto.chatId}`).emit('newMessage', message);

      const participants = await this.prisma.chatParticipant.findMany({
        where: { chatId: dto.chatId },
        include: { eventUser: { include: { user: { select: userSelect } } } },
      });

      for (const { eventUser } of participants) {
        this.server.to(`user-${eventUser.user.id}`).emit('chat:updated', {
          chatId: dto.chatId,
          lastMessage: message,
        });
      }

      return message;
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // @SubscribeMessage('getMessages')
  // async handleGetMessages(
  //   @MessageBody() chatId: number,
  //   @CurrentEventUser() eventUser: EventUser,
  // ) {
  //   const messages = await this.messageService.getMessages(chatId);
  //   return messages;
  // }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { chatId: number; eventId: number },
    @ConnectedSocket() client: SocketWithUser,
  ) {
    const { chatId, eventId } = data;
    const user = client?.user;

    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        userId: user.sub,
        eventId,
      },
    });

    if (!eventUser) {
      throw new ForbiddenException('User is not part of the event');
    }

    const isParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId,
        eventUserId: eventUser.id,
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const messages = await this.messageService.getMessages(chatId, eventUser);

    return messages;
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() { userId }: { userId: number },
    @ConnectedSocket() client: SocketWithUser,
  ) {
    client.join(`user-${userId}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() { chatId }: { chatId: number },
    @ConnectedSocket() client: SocketWithUser,
  ) {
    client.join(`chat-${chatId}`);
    this.server
      .to(`chat-${chatId}`)
      .emit('message', `${client.user?.sub} has joined the chat`);
  }
}

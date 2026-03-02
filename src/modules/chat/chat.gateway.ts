import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  async notifyChatCreated(chat) {
    for (const user of chat.users) {
      this.server.to(user.id.toString()).emit('chatCreated', {
        id: chat.id,
        name: chat.name,
        type: chat.type,
        users: chat.participants.map((p) => ({
          id: p.eventUser.id,
          user: p.eventUser.user,
        })),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      });
    }
  }
}

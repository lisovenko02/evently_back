// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { MessageService } from './message.service';
// import { CreateMessageDto } from './dto/create-message.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { JwtService } from '@nestjs/jwt';

// @WebSocketGateway({ cors: true })
// export class MessageGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer() server: Server;

//   constructor(
//     private readonly messageService: MessageService,
//     private readonly jwtService: JwtService,
//     private readonly prisma: PrismaService,
//   ) {}

//   async handleConnection(client: Socket) {
//     try {
//       const token = client.handshake.auth?.token;

//       if (!token) {
//         console.log(`Client ${client.id} rejected: No token`);
//         client.disconnect();
//         return;
//       }

//       const decoded = this.jwtService.verify(token);
//       if (!decoded?.sub) {
//         console.log(`Client ${client.id} rejected: Invalid token`);
//         client.disconnect();
//         return;
//       }

//       const user = await this.prisma.user.findUnique({
//         where: { id: decoded.sub },
//       });

//       if (!user) {
//         console.log(`Client ${client.id} rejected: User not found`);
//         client.disconnect();
//         return;
//       }

//       client.data.user = user;
//       console.log(`Client connected: ${client.id}, User: ${user.id}`);
//     } catch (error) {
//       console.log(`Client ${client.id} rejected: ${error.message}`);
//       client.disconnect();
//     }
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   @SubscribeMessage('joinEvent')
//   handleJoinEvent(client: Socket, eventId: number) {
//     client.join(`event-${eventId}`);
//     console.log(`Client ${client.id} joined room event-${eventId}`);
//   }

//   @SubscribeMessage('sendMessage')
//   async handleSendMessage(client: Socket, payload: CreateMessageDto) {
//     const message = await this.messageService.createMessage(
//       payload,
//       client.data.user,
//     );

//     if (payload.isGroupMessage === false && message.receiverId) {
//       const room1 = `private-${payload.eventId}-${client.data.user.id}-${message.receiverId}`;
//       const room2 = `private-${payload.eventId}-${message.receiverId}-${client.data.user.id}`;

//       this.server.to(room1).to(room2).emit('privateMessageReceived', message);
//     } else if (payload.isGroupMessage === true && payload.chatGroupId) {
//       const groupRoom = `group-${payload.eventId}-${payload.chatGroupId}`;
//       this.server.to(groupRoom).emit('groupMessageReceived', message);
//     } else {
//       // fallback, broadcast to whole event room
//       this.server
//         .to(`event-${payload.eventId}`)
//         .emit('messageReceived', message);
//     }

//     return message;
//   }

//   @SubscribeMessage('joinPrivateRoom')
//   handleJoinPrivateRoom(
//     client: Socket,
//     payload: { eventId: number; userId: number },
//   ) {
//     const currentUserId = client.data.user.id;
//     const room = `private-${payload.eventId}-${currentUserId}-${payload.userId}`;
//     client.join(room);
//     console.log(
//       `Client ${client.id} joined private room ${room} (User ${currentUserId} <-> ${payload.userId})`,
//     );
//   }
// }

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { ChatType, EventUser } from '@prisma/client';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { ChatGateway } from './chat.gateway';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { userSelect } from 'src/common/prisma-selects/user.select';
import { PrismaLike } from '../event-user-history/event-user-history.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async createPrivateChat(senderId: number, dto: CreatePrivateChatDto) {
    const { eventId, receiverEventUserId } = dto;

    if (senderId === receiverEventUserId) {
      throw new ConflictException('Cannot create chat with yourself');
    }

    const [sender, receiver] = await Promise.all([
      this.prisma.eventUser.findUnique({ where: { id: senderId } }),
      this.prisma.eventUser.findUnique({
        where: { id: receiverEventUserId },
        include: {
          user: {
            select: {
              avatar: true,
            },
          },
        },
      }),
    ]);

    if (
      !sender ||
      !receiver ||
      sender.eventId !== eventId ||
      receiver.eventId !== eventId
    ) {
      throw new NotFoundException('Invalid participants or event');
    }

    const existing = await this.prisma.chat.findFirst({
      where: {
        type: ChatType.PRIVATE,
        eventId,
        participants: {
          some: { eventUserId: senderId },
        },
        AND: {
          participants: {
            some: { eventUserId: receiverEventUserId },
          },
        },
      },
    });

    if (existing) {
      throw new ConflictException('Private chat already exists');
    }

    return this.prisma.chat.create({
      data: {
        type: ChatType.PRIVATE,
        eventId,
        creatorId: senderId,
        recipientId: receiver.id ?? null,
        participants: {
          createMany: {
            data: [
              { eventUserId: senderId },
              { eventUserId: receiverEventUserId },
            ],
          },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async createGroupChat(
    creatorId: number,
    dto: CreateGroupChatDto,
    imageUrl: string,
  ) {
    const { eventId, name, participantIds } = dto;

    const uniqueIds = Array.from(new Set([...participantIds, creatorId]));

    const participants = await this.prisma.eventUser.findMany({
      where: {
        id: { in: uniqueIds },
        eventId,
      },
    });

    if (participants.length !== uniqueIds.length) {
      throw new NotFoundException('Some participants not found in event');
    }

    const newChat = await this.prisma.chat.create({
      data: {
        type: ChatType.GROUP,
        name,
        eventId,
        creatorId,
        chatImg:
          imageUrl ??
          'https://events2025.s3.eu-north-1.amazonaws.com/3/9e476c13-4f93-4acd-bd45-17216cc3c1dc',
        participants: {
          createMany: {
            data: uniqueIds.map((id) => ({ eventUserId: id })),
          },
        },
      },
      include: {
        participants: true,
        // {
        //   include: {
        //     eventUser: {
        //       select: {
        //         id: true,
        //         // user: { select: userSelect },
        //       },
        //     },
        //   },
        // },
      },
    });

    // await this.chatGateway.notifyChatCreated(newChat);

    return newChat;
  }

  async createGeneralChat(eventId: number) {
    const event = await this.prisma.event.findFirst({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const organizer = await this.prisma.eventUser.findFirst({
      where: {
        eventId,
        role: 'ORGANIZER',
      },
    });

    if (!organizer) {
      throw new NotFoundException('Organizer not found for this event');
    }
    return this.prisma.chat.create({
      data: {
        type: ChatType.GENERAL,
        chatImg: event.image,
        name: event.title,
        event: {
          connect: { id: eventId },
        },
        creator: {
          connect: { id: organizer.id },
        },
        participants: {
          create: {
            eventUserId: organizer.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async getUserChats(eventUser: EventUser) {
    const chats = await this.prisma.chat.findMany({
      where: {
        eventId: eventUser.eventId,
        OR: [
          {
            participants: {
              some: {
                eventUserId: eventUser.id,
              },
            },
          },
          {
            recipientId: eventUser.id,
          },
        ],
      },
      include: {
        lastMessage: {
          include: {
            sender: {
              include: {
                user: { select: userSelect },
              },
            },
          },
        },

        creator: {
          select: {
            id: true,
            user: { select: userSelect },
          },
        },
        recipient: {
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

    const processedChats = chats.map((chat) => {
      const isCreator = chat.creatorId === eventUser.id;

      return {
        ...chat,
        isCreator,
      };
    });

    const sortedChats = [
      ...processedChats.filter((chat) => chat.type === ChatType.GENERAL),
      ...processedChats.filter((chat) => chat.type !== ChatType.GENERAL),
    ];

    return sortedChats;
  }

  async getChatDetails(chatId: number, eventUserId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: { eventUserId },
        },
      },
      include: {
        participants: {
          include: {
            eventUser: {
              select: {
                id: true,
                role: true,
                user: {
                  select: {
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!chat) throw new NotFoundException('Chat not found or access denied');

    const isCreator = chat.creator?.id === eventUserId;

    let otherParticipant = null;
    if (chat.type === ChatType.PRIVATE) {
      const other = chat.participants.find(
        (p) => p.eventUser.id !== eventUserId,
      );

      if (other) {
        otherParticipant = {
          username: other.eventUser.user.username,
          avatar: other.eventUser.user.avatar,
          role: other.eventUser.role,
          id: other.eventUser.id,
        };
      }
    }

    const sortedParticipants = [
      ...chat.participants.filter((p) => p.eventUser.id === chat.creator?.id),
      ...chat.participants.filter((p) => p.eventUser.id !== chat.creator?.id),
    ].map((p) => ({
      id: p.eventUser.id,
      role: p.eventUser.role,
      username: p.eventUser.user.username,
      avatar: p.eventUser.user.avatar,
    }));

    return {
      id: chat.id,
      name: chat.name,
      type: chat.type,
      chatImg: chat.chatImg,
      eventId: chat.eventId,
      creatorId: chat.creatorId,
      isCreator,
      otherParticipant,
      participants: sortedParticipants,
    };
  }

  async addParticipantToGroupChat(
    chatId: number,
    newParticipantId: number,
    eventUser: EventUser,
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        event: true,
        participants: true,
      },
    });

    if (!chat || chat.type !== 'GROUP') {
      throw new NotFoundException('Chat not found or Chat type not group');
    }

    const targetEventUser = await this.prisma.eventUser.findUnique({
      where: { id: newParticipantId },
    });

    if (!targetEventUser || targetEventUser.eventId !== chat.event.id) {
      throw new ConflictException('User is not part of this event');
    }

    const exists = chat.participants.find(
      (p) => p.eventUserId === newParticipantId,
    );
    if (exists) throw new ConflictException('User already in chat');

    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        participants: {
          create: { eventUserId: newParticipantId },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async updateGroupName(chatId: number, eventUser: EventUser, name: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || chat.type !== 'GROUP')
      throw new ForbiddenException('Only group chats can be renamed');
    if (chat.creatorId !== eventUser.id)
      throw new ForbiddenException('Only creator can rename group');
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { name },
    });
  }

  async updateGroupImage(
    chatId: number,
    eventUser: EventUser,
    imageUrl: string,
  ) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || chat.type !== 'GROUP')
      throw new ForbiddenException('Only group chats can be updated');
    if (chat.creatorId !== eventUser.id)
      throw new ForbiddenException('Only creator can change image');

    return this.prisma.chat.update({
      where: { id: chatId },
      data: { chatImg: imageUrl },
    });
  }

  async addApprovedUserToGeneralChat(
    eventUserId: number,
    prisma: PrismaLike = this.prisma,
  ) {
    const eventUser = await prisma.eventUser.findUnique({
      where: { id: eventUserId },
      include: { event: true },
    });

    if (!eventUser) throw new NotFoundException('EventUser not found');

    let generalChat = await this.prisma.chat.findFirst({
      where: {
        eventId: eventUser.eventId,
        type: ChatType.GENERAL,
      },
      include: {
        participants: true,
      },
    });

    if (!generalChat) {
      generalChat = await this.createGeneralChat(eventUser.eventId);
    }

    const alreadyParticipant = generalChat.participants.some(
      (p) => p.eventUserId === eventUserId,
    );

    if (alreadyParticipant) return generalChat;

    return prisma.chat.update({
      where: { id: generalChat.id },
      data: {
        participants: {
          create: {
            eventUserId,
          },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async kickParticipantFromGroupChat(
    chatId: number,
    eventUserId: number,
    currentUser: EventUser,
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== ChatType.GROUP) {
      throw new ForbiddenException('Only group chats can be modified');
    }

    if (eventUserId === currentUser.id) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    if (chat.creatorId !== currentUser.id) {
      throw new ForbiddenException(
        'Only the chat creator can remove participants',
      );
    }

    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_eventUserId: {
          chatId,
          eventUserId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in this chat');
    }

    await this.prisma.chatParticipant.delete({
      where: {
        id: participant.id,
      },
    });

    return { message: 'Participant removed successfully' };
  }

  async deleteGroupChat(chatId: number, user: EventUser) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== 'GROUP') {
      throw new BadRequestException('Only group chats can be deleted');
    }

    if (chat.creatorId !== user.id) {
      throw new ForbiddenException(
        'You are not the creator of this group chat',
      );
    }

    await this.prisma.chat.delete({
      where: { id: chatId },
    });

    return { message: 'Group chat deleted successfully' };
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { userSelect } from 'src/common/prisma-selects/user.select';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  async createBoard(eventId: number) {
    const board = await this.prisma.taskBoard.findUnique({
      where: { eventId: eventId },
    });

    if (board) {
      throw new ConflictException('Board is already exist in this event');
    }

    return await this.prisma.taskBoard.create({
      data: {
        eventId,
      },
    });
  }

  // potom pominyat
  async getEventBoard(eventId: number) {
    return await this.prisma.taskBoard.findUnique({
      where: { eventId },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                assignees: {
                  include: {
                    assignee: {
                      include: {
                        user: { select: userSelect },
                      },
                    },
                    assignedBy: {
                      include: {
                        user: { select: userSelect },
                      },
                    },
                  },
                },
                comments: {
                  include: {
                    author: {
                      include: {
                        user: { select: userSelect },
                      },
                    },
                  },
                },
                creator: {
                  include: {
                    user: { select: userSelect },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

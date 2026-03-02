import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventUserGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const eventId = Number(
      request.body?.eventId ||
        request.query?.eventId ||
        request.params?.eventId,
    );

    if (!eventId) throw new NotFoundException('eventId is required');

    const eventUser = await this.prisma.eventUser.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    if (!eventUser) {
      throw new NotFoundException('User is not part of this event');
    }

    request.eventUser = eventUser;
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_KEY } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const eventId = request.body.eventId || request.params.eventId;

    if (!eventId) {
      throw new ForbiddenException('Event ID is required.');
    }

    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId: Number(eventId),
        userId: user.id,
      },
    });

    if (!eventUser) {
      throw new ForbiddenException('User is not a member of this event.');
    }

    const hasRole = requiredRoles.includes(eventUser.role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have the required role.');
    }

    return true;
  }
}

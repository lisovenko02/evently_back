import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateEventUserRoleDto } from './dto/update-role-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventUserService {
  constructor(private prisma: PrismaService) {}

  async updateRole(
    updateUserRoleRoleDto: UpdateEventUserRoleDto,
    currentUser: User,
  ) {
    const { eventId, role, userId } = updateUserRoleRoleDto;

    const eventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId: eventId,
        userId: userId,
      },
    });

    if (!eventUser) {
      throw new BadRequestException('User not found for the event');
    }

    const updatedEventUser = await this.prisma.eventUser.update({
      where: {
        id: eventUser.id,
      },
      data: {
        role: role,
      },
    });

    return updatedEventUser;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserPinService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPins(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.userPin.findMany({
      where: { userId },
      include: { pin: true },
    });
  }

  async buyPin(pinId: number, user: User) {
    const pin = await this.prisma.pin.findUnique({
      where: { id: pinId },
    });

    if (!pin) {
      throw new NotFoundException('Pin not found');
    }

    const hasPin = await this.prisma.userPin.findFirst({
      where: {
        userId: user.id,
        pinId,
      },
    });

    if (hasPin) {
      throw new BadRequestException('You already own this pin');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (currentUser.points < pin.pointsCost) {
      throw new BadRequestException('Not enough points to purchase this pin');
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: pin.pointsCost } },
      }),
      this.prisma.userPin.create({
        data: {
          userId: user.id,
          pinId,
        },
      }),
    ]);
  }
}

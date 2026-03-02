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

  async getUserPinsWithMissing(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const userPins = await this.prisma.userPin.findMany({
      where: { userId },
      include: {
        pin: {
          select: {
            id: true,
            title: true,
            image: true,
            rarity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const allPins = await this.prisma.pin.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        rarity: true,
      },
      orderBy: [
        {
          rarity: 'desc', // LEGENDARY -> EPIC -> RARE -> COMMON
        },
        {
          id: 'asc',
        },
      ],
    });

    const userPinIds = userPins.map((userPin) => userPin.pinId);

    const allPinsWithOwnership = allPins.map((pin) => ({
      ...pin,
      isOwned: userPinIds.includes(pin.id),
    }));

    const sortedPins = allPinsWithOwnership.sort((a, b) => {
      if (a.isOwned && !b.isOwned) return -1;
      if (!a.isOwned && b.isOwned) return 1;

      const rarityOrder = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });

    return {
      pins: sortedPins,
      totalOwned: userPins.length,
      totalAvailable: allPins.length,
    };
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

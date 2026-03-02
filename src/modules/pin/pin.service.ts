import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePinDto } from './dto/create-pin.dto';

@Injectable()
export class PinService {
  constructor(private readonly prisma: PrismaService) {}

  async createPin(dto: CreatePinDto) {
    return this.prisma.pin.create({ data: dto });
  }
}

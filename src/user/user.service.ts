import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { SignUpDto } from 'src/auth/dto/signUp.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(signUpDto: SignUpDto) {
    const { password, ...user } = signUpDto;

    const hashedPassword = await hash(password);
    console.log(hashedPassword);

    return this.prismaService.user.create({
      data: {
        password: hashedPassword,
        ...user,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOne(userId: number) {
    return await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateHashedRefreshToken(userId: number, hashedRt: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRt,
      },
    });
  }
}

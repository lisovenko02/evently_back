import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Module } from 'src/S3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}

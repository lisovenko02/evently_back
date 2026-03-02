import {
  Controller,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/configs/multer.config';
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator';
import { User } from '@prisma/client';
import { S3Service } from 'src/modules/S3/s3.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

  @Public()
  @Get(':id')
  async getUserProfileById(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getUserProfileById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) throw new Error('File is required');

    const { fileUrl } = await this.s3Service.uploadFile(file, user.id);

    return this.userService.updateUserAvatar(user.id, fileUrl);
  }
}

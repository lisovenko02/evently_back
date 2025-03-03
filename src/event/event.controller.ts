import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/configs/multer.config';
import { S3Service } from 'src/S3/s3.service';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async createEvent(
    @UploadedFile() file: Express.Multer.File,
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ) {
    let imageUrl = null;
    console.log(file);
    if (file) {
      imageUrl = await this.s3Service.uploadFile(file, user.id);
    }

    return this.eventService.createEvent(createEventDto, user, imageUrl);
  }

  @Public()
  @Get()
  async getAllEvents() {
    return this.eventService.getEvents();
  }

  @Get(':id/members')
  @Public()
  async getAllMembers(@Param('id', ParseIntPipe) eventId: number) {
    return this.eventService.getEventMembers(eventId);
  }
}

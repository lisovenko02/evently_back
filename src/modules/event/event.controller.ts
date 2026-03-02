import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from 'src/modules/auth/decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/configs/multer.config';
import { S3Service } from 'src/modules/S3/s3.service';
import { EventUserGuard } from '../auth/guards/eventUser/eventUser-guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateEventVisibilityDto } from './dto/upda-event-visibility.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth/optional-jwt-auth.guard';
import {
  userMinimalSelect,
  userSelect,
} from 'src/common/prisma-selects/user.select';

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
    let imageUrl;

    if (file) {
      try {
        const { fileUrl } = await this.s3Service.uploadFile(file, user.id);

        imageUrl = fileUrl;
      } catch {
        throw new InternalServerErrorException('Failed to upload image');
      }
    }

    return this.eventService.createEvent(createEventDto, user, imageUrl);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':eventId/me')
  async getEventContext(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user?: User,
  ) {
    if (!user) {
      return { isAuthenticated: false };
    }

    return this.eventService.getEventContext(eventId, user.id);
  }

  @Public()
  @Get()
  async getAllEvents() {
    return this.eventService.getEvents();
  }

  @Get(':id/members')
  async getAllMembers(
    @Param('id', ParseIntPipe) eventId: number,
    @Query('full') full?: string,
  ) {
    const isMinimal = full === 'false';
    const userSelectFields = isMinimal ? userMinimalSelect : userSelect;

    return this.eventService.getEventMembers(eventId, userSelectFields);
  }

  @Public()
  @Get('/event/:id')
  async getEventById(@Param('id', ParseIntPipe) eventId: number) {
    return this.eventService.getEventById(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  // potom bolee prof
  async getUserEvents(@CurrentUser() user: User) {
    console.log('user', user);
    return this.eventService.getEventsByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:eventId/join')
  joinOpenEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ) {
    return this.eventService.joinOpenEvent(eventId, user);
  }

  @Roles(Role.ORGANIZER)
  @UseGuards(EventUserGuard, RolesGuard)
  @Patch('/visibility/:eventId')
  async updateEventVisibility(
    @Body() dto: UpdateEventVisibilityDto,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.eventService.updateEventVisibility(dto, eventId);
  }
}

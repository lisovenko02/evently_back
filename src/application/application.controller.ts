import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { UpdateApplicationStatusDto } from './dto/update-appl-status.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('create')
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationService.createApplication(
      createApplicationDto,
      user,
    );
  }

  @Roles(Role.ORGANIZER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('status')
  async updateStatus(
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @CurrentUser() user: User,
  ) {
    const { applicationId, status, approverComment } = updateStatusDto;
    return this.applicationService.updateApplicationStatus(
      applicationId,
      approverComment,
      status,
      user,
    );
  }
}

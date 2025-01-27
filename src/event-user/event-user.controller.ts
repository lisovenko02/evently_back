import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateEventUserRoleDto } from './dto/update-role-user.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('event-user')
export class EventUserController {
  constructor(private readonly eventUserService: EventUserService) {}

  @Roles(Role.ORGANIZER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('role')
  async updateRole(
    @Body() updateUserRoleRoleDto: UpdateEventUserRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.eventUserService.updateRole(updateUserRoleRoleDto, currentUser);
  }
}

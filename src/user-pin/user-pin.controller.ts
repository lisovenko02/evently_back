import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserPinService } from './user-pin.service';
import { CreateUserPinDto } from './dto/create-user-pin.dto';
import { UpdateUserPinDto } from './dto/update-user-pin.dto';

@Controller('user-pin')
export class UserPinController {
  constructor(private readonly userPinService: UserPinService) {}

  @Post()
  create(@Body() createUserPinDto: CreateUserPinDto) {
    return this.userPinService.create(createUserPinDto);
  }

  @Get()
  findAll() {
    return this.userPinService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPinService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserPinDto: UpdateUserPinDto) {
    return this.userPinService.update(+id, updateUserPinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPinService.remove(+id);
  }
}

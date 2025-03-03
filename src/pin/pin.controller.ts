import { Controller, Post, Body } from '@nestjs/common';
import { PinService } from './pin.service';
import { CreatePinDto } from './dto/create-pin.dto';

@Controller('pin')
export class PinController {
  constructor(private readonly pinService: PinService) {}

  @Post()
  async create(@Body() createPinDto: CreatePinDto) {
    return this.pinService.createPin(createPinDto);
  }
}

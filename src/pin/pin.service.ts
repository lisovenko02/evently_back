import { Injectable } from '@nestjs/common';
import { CreatePinDto } from './dto/create-pin.dto';
import { UpdatePinDto } from './dto/update-pin.dto';

@Injectable()
export class PinService {
  create(createPinDto: CreatePinDto) {
    return 'This action adds a new pin';
  }

  findAll() {
    return `This action returns all pin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pin`;
  }

  update(id: number, updatePinDto: UpdatePinDto) {
    return `This action updates a #${id} pin`;
  }

  remove(id: number) {
    return `This action removes a #${id} pin`;
  }
}

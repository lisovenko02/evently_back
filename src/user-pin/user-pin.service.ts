import { Injectable } from '@nestjs/common';
import { CreateUserPinDto } from './dto/create-user-pin.dto';
import { UpdateUserPinDto } from './dto/update-user-pin.dto';

@Injectable()
export class UserPinService {
  create(createUserPinDto: CreateUserPinDto) {
    return 'This action adds a new userPin';
  }

  findAll() {
    return `This action returns all userPin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPin`;
  }

  update(id: number, updateUserPinDto: UpdateUserPinDto) {
    return `This action updates a #${id} userPin`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPin`;
  }
}

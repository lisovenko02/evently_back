import { Test, TestingModule } from '@nestjs/testing';
import { UserPinController } from './user-pin.controller';
import { UserPinService } from './user-pin.service';

describe('UserPinController', () => {
  let controller: UserPinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPinController],
      providers: [UserPinService],
    }).compile();

    controller = module.get<UserPinController>(UserPinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

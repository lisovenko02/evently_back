import { Test, TestingModule } from '@nestjs/testing';
import { UserPinService } from './user-pin.service';

describe('UserPinService', () => {
  let service: UserPinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPinService],
    }).compile();

    service = module.get<UserPinService>(UserPinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

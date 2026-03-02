import { Module } from '@nestjs/common';
import { PinService } from './pin.service';
import { PinController } from './pin.controller';

@Module({
  controllers: [PinController],
  providers: [PinService],
})
export class PinModule {}

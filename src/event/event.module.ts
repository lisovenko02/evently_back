import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { S3Module } from 'src/S3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { S3Module } from '../S3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}

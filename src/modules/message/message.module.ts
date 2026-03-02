import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { S3Module } from '../S3/s3.module';
import { MessageController } from './message.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigJwtModule } from 'src/configs/config-jwt.module';
import { WsJwtGuard } from '../auth/guards/websocket/ws-jwt-guard';

@Module({
  imports: [S3Module, AuthModule, ConfigJwtModule],
  controllers: [MessageController],
  providers: [MessageGateway, MessageService, WsJwtGuard],
})
export class MessageModule {}

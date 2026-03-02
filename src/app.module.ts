import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './modules/event/event.module';
import { EventUserModule } from './modules/event-user/event-user.module';
import { PinModule } from './modules/pin/pin.module';
import { UserPinModule } from './modules/user-pin/user-pin.module';
import { TaskModule } from './modules/task/task.module';
import { ApplicationModule } from './modules/application/application.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth/jwt-auth.guard';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { RefreshStrategy } from './modules/auth/strategies/refresh-token.strategy';
import { ConfigJwtModule } from './configs/config-jwt.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MessageModule } from './modules/message/message.module';
import { ChatModule } from './modules/chat/chat.module';
import { BoardModule } from './modules/board/board.module';
import { ColumnModule } from './modules/column/column.module';

@Module({
  imports: [
    ConfigJwtModule,
    PrismaModule,
    AuthModule,
    UserModule,
    EventModule,
    EventUserModule,
    PinModule,
    UserPinModule,
    TaskModule,
    ApplicationModule,
    MessageModule,
    ChatModule,
    BoardModule,
    ColumnModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    RefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}

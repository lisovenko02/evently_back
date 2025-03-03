import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { EventUserModule } from './event-user/event-user.module';
import { PinModule } from './pin/pin.module';
import { UserPinModule } from './user-pin/user-pin.module';
import { TaskModule } from './task/task.module';
import { ApplicationModule } from './application/application.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RefreshStrategy } from './auth/strategies/refresh-token.strategy';
import { ConfigJwtModule } from './configs/config-jwt.module';

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
  ],
})
export class AppModule {}

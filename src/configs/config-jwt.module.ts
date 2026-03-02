import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/modules/auth/configs/jwt.config';
import refreshConfig from 'src/modules/auth/configs/refresh.config';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
  ],
  exports: [JwtModule, ConfigModule],
})
export class ConfigJwtModule {}

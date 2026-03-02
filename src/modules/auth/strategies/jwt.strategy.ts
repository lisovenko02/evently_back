import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }
  async validate(payload: { sub: number }) {
    try {
      const userId = payload?.sub;

      if (!userId) {
        return null;
      }

      const user = await this.authService.validateJwtToken(userId);

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.log('JwtStrategy validate error:', error.message);
      return null;
    }
  }
}

import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { UserService } from 'src/user/user.service';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './configs/refresh.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async register(signUpDto: SignUpDto) {
    const user = await this.userService.findByEmail(signUpDto.email);

    if (user) throw new ConflictException('User is already exist');

    return this.userService.create(signUpDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordMatched = verify(user.password, password);
    if (!isPasswordMatched)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, username: user.username };
  }

  async login(userId: number, username: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRT = await hash(refreshToken);

    await this.userService.updateHashedRefreshToken(userId, hashedRT);

    return {
      id: userId,
      username,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: { sub: number } = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return { accessToken, refreshToken };
  }

  async validateJwtToken(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const currentUser = { id: user.id };
    return currentUser;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const refreshTokenMatched = await verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatched)
      throw new UnauthorizedException('Invalid refresh token');

    const currentUser = { id: user.id };

    return currentUser;
  }
}

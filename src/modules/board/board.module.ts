import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { ConfigJwtModule } from 'src/configs/config-jwt.module';

@Module({
  imports: [ConfigJwtModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}

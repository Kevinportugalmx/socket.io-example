import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

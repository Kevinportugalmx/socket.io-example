import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private _authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: Socket = context.switchToWs().getClient();
    if (!socket.id) {
      const token = socket.handshake.query.authentication as string;
      const validate = await this._authService.validateToken(token);

      return !!validate;
    }
    return true;
  }
}

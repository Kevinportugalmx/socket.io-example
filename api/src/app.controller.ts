import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly _authService: AuthService) {}

  @Post('login')
  async login(): Promise<{ token: string }> {
    const token = await this._authService.createToken({ id: 1 });
    return { token };
  }
}

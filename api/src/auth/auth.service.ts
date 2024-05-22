import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async validateToken(token: string): Promise<{ id: number } | undefined> {
    const { id } = await this.jwtService.verifyAsync(token, {
      secret: 'secret',
    });
    return id ?? undefined;
  }

  async createToken(user: { id: number }): Promise<string> {
    return this.jwtService.signAsync(
      { id: user.id },
      { secret: 'secret', expiresIn: '1y' },
    );
  }
}

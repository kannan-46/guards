import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  private async extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = await this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('invalid token');
    }
    try {
      const payload = await this.jwt.verifyAsync(token);
      request['user'] = payload;
      console.log('auth granted');
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

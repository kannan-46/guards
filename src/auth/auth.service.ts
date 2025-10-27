import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createUser } from 'src/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { login } from 'src/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly user: UserService,
    private readonly jwt: JwtService,
  ) {}

  async regitser(dto: createUser) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const newUser = await this.user.createUser({
      ...dto,
      password: hashed,
    });

    const { password, ...result } = newUser;
    return result;
  }

  async login(dto: login) {
    const user = await this.user.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const compare = await bcrypt.compare(dto.password, user.password);
    if (!compare) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      sub: user.userId,
      email: user.email,
    };

    const accessToken = await this.jwt.signAsync(payload);
    return {
      access_Token: accessToken,
    };
  }
}

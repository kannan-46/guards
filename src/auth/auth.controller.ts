import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUser } from 'src/dto/createUser.dto';
import { login } from 'src/dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth:AuthService){}

    @Post('register')
    async register(@Body() dto:createUser){
        return this.auth.register(dto)
    }

    @Post('login')
    async login(@Body() dto:login){
        return this.auth.login(dto)
    }
}

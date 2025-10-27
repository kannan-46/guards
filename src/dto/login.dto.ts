import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class login{
    @IsNotEmpty()
    @IsEmail()
    email:string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password:string
}
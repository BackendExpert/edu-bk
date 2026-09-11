import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/)
    @Matches(/[a-z]/)
    @Matches(/[0-9]/)
    @Matches(/[^A-Za-z0-9]/)
    password!: string;
}
import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/)
    @Matches(/[a-z]/)
    @Matches(/[0-9]/)
    @Matches(/[^A-Za-z0-9]/)
    password!: string;
}
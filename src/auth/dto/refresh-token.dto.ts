import { IsOptional, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    @MinLength(20)
    refreshToken!: string;

    @IsOptional()
    @IsString()
    institutionId?: string;
}
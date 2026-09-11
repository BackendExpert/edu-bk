import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class UpdateRateLimitDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    windowSeconds?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
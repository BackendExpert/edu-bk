import { IsBoolean, IsOptional, IsString, } from 'class-validator';

export class CreatePermissionDto {
    @IsString()
    name!: string;

    @IsString()
    resource!: string;

    @IsString()
    action!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
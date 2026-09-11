import { IsOptional, IsString } from "class-validator";

export class GoogleLoginDto {

    @IsString()
    credential!: string;

    @IsOptional()
    @IsString()
    deviceId?: string;
}
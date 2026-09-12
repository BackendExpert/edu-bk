import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateIf,
} from 'class-validator';

export class CreatePlanDTO {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsString()
    subtitle!: string;

    @IsIn(['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'])
    type!: string;

    @ValidateIf((o) => !o.isUnlimitedStudents)
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxStudents?: number;

    @IsOptional()
    @IsBoolean()
    isUnlimitedStudents?: boolean;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(1)
    maxBranches!: number;

    @IsIn(['CONTACT', 'CUSTOM'])
    pricingType!: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    monthlyPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    yearlyPrice?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @IsArray()
    @IsString({ each: true })
    features!: string[];

    @IsArray()
    @IsString({ each: true })
    includedModules!: string[];

    @IsArray()
    @IsString({ each: true })
    aiFeatures!: string[];
}
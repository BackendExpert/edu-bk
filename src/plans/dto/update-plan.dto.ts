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

export class UpdatePlanDTO {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsIn(['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'])
    type?: string;

    @IsOptional()
    @ValidateIf((o) => !o.isUnlimitedStudents)
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxStudents?: number;

    @IsOptional()
    @IsBoolean()
    isUnlimitedStudents?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(1)
    maxBranches?: number;

    @IsOptional()
    @IsIn(['CONTACT', 'CUSTOM'])
    pricingType?: string;

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

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    features?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    includedModules?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    aiFeatures?: string[];
}
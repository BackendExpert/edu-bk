import {
    IsArray,
    IsEnum,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyEffect, PolicyOperator } from 'src/abac/schema/policy.schema';

export class UpdatePolicyConditionDto {
    @IsOptional()
    @IsString()
    attribute?: string;

    @IsOptional()
    @IsEnum(PolicyOperator)
    operator?: PolicyOperator;

    @IsOptional()
    value?: unknown;
}

export class UpdatePolicyDTO {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsMongoId()
    permissionId?: string;

    @IsOptional()
    @IsEnum(PolicyEffect)
    effect?: PolicyEffect;

    @IsOptional()
    @IsNumber()
    version?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdatePolicyConditionDto)
    conditions?: UpdatePolicyConditionDto[];
}
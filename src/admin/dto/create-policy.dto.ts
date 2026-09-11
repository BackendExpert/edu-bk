import { IsArray, IsDefined, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyEffect, PolicyOperator } from 'src/abac/schema/policy.schema';

export class CreatePolicyConditionDto {
    @IsString()
    attribute!: string;

    @IsEnum(PolicyOperator)
    operator!: PolicyOperator;

    @IsDefined()
    value!: unknown;
}

export class CreatePolicyDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsMongoId()
    permissionId!: string;

    @IsEnum(PolicyEffect)
    effect!: PolicyEffect;

    @IsOptional()
    @IsNumber()
    version?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePolicyConditionDto)
    conditions?: CreatePolicyConditionDto[];
}
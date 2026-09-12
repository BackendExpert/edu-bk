import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateInstitutionDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(150)
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    code?: string;

    @IsOptional()
    @IsMongoId()
    institution_admin!: string

    @IsOptional()
    @IsMongoId()
    plan_id!: string

    @IsOptional()
    @IsString()
    @MaxLength(150)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    addressLine1?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    addressLine2?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    alternatePhone?: string;

    @IsOptional()
    active?: boolean;
}
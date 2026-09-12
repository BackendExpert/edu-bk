import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateInstitutionDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(150)
    name!: string;

    @IsMongoId()
    @IsNotEmpty()
    institution_admin!: string

    @IsMongoId()
    @IsNotEmpty()
    plan_id!: string

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    code!: string;

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
}
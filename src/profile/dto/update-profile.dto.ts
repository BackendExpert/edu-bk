import {
    IsDateString,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    middleName?: string | null;

    @IsOptional()
    @IsString()
    displayName?: string | null;

    @IsOptional()
    @IsString()
    title?: string | null;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string | null;

    @IsOptional()
    @IsString()
    gender?: string | null;

    @IsOptional()
    @IsString()
    nic?: string | null;

    @IsOptional()
    @IsString()
    passportNumber?: string | null;

    @IsOptional()
    @IsString()
    nationality?: string | null;

    @IsOptional()
    @IsString()
    phone?: string | null;

    @IsOptional()
    @IsString()
    alternatePhone?: string | null;

    @IsOptional()
    @IsString()
    addressLine1?: string | null;

    @IsOptional()
    @IsString()
    addressLine2?: string | null;

    @IsOptional()
    @IsString()
    city?: string | null;

    @IsOptional()
    @IsString()
    state?: string | null;

    @IsOptional()
    @IsString()
    postalCode?: string | null;

    @IsOptional()
    @IsString()
    emergencyContactName?: string | null;

    @IsOptional()
    @IsString()
    emergencyContactPhone?: string | null;

    @IsOptional()
    @IsString()
    emergencyContactRelationship?: string | null;

    @IsOptional()
    @IsString()
    facebook?: string | null;

    @IsOptional()
    @IsString()
    bio?: string | null;

    @IsOptional()
    @IsString()
    website?: string | null;

    @IsOptional()
    @IsString()
    linkedin?: string | null;
}
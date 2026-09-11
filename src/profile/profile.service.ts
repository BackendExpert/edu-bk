import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Profile, ProfileDocument } from "./schema/profile.schema";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "src/users/schemas/user.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { EmailService } from "src/email/email.service";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AuditLog, AuditLogDocument, AuditAction, AuditResult, AuditSeverity } from "src/audit/schemas/audit-log.schema";
import { auditlogService } from "src/audit/auditlog.service";
import { promises as fs } from "fs";
import * as path from "path";


@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(Profile.name)
        private readonly profileModel: Model<ProfileDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        private readonly emailService: EmailService,
        private readonly auditlogService: auditlogService
    ) { }

    async FetchMyProfile(user: AuthenticatedUser) {

        const profile = await this.profileModel.findOne({ userId: user.id }).populate({ path: 'userId', populate: { path: 'roleId' } })

        if (!profile) {
            throw new NotFoundException(`Profile not found for userId: ${user.id}`)
        }

        const auditlogs = await this.auditlogModel.find({ userId: user.id })

        return {
            success: true,
            message: 'Profile Fetched Success',
            result: {
                profile,
                auditlogs
            }
        }
    }
    async UpdateProfile(
        user: AuthenticatedUser,
        dto: UpdateProfileDto,
        profileImage,
        ipAddress: string,
        location: any,
    ) {
        const profile = await this.profileModel.findOne({
            userId: user.id,
        });

        if (!profile) {
            throw new NotFoundException("The Profile Cannot be Found");
        }

        if (profileImage) {
            if (profile.profileImage) {
                const oldImagePath = path.join(
                    process.cwd(),
                    "uploads",
                    "profile",
                    profile.profileImage,
                );

                await fs.unlink(oldImagePath);
            }

            profile.profileImage = profileImage.filename;
        }

        profile.firstName = dto.firstName?.trim() || profile.firstName;
        profile.lastName = dto.lastName?.trim() || profile.lastName;
        profile.middleName = dto.middleName?.trim() || profile.middleName;
        profile.displayName = dto.displayName?.trim() || profile.displayName;
        profile.title = dto.title?.trim() || profile.title;
        profile.dateOfBirth = dto.dateOfBirth
            ? new Date(dto.dateOfBirth)
            : profile.dateOfBirth;
        profile.gender = dto.gender?.trim() || profile.gender;
        profile.nic = dto.nic?.trim() || profile.nic;
        profile.passportNumber = dto.passportNumber?.trim() || profile.passportNumber;
        profile.nationality = dto.nationality?.trim() || profile.nationality;
        profile.phone = dto.phone?.trim() || profile.phone;
        profile.alternatePhone = dto.alternatePhone?.trim() || profile.alternatePhone;
        profile.addressLine1 = dto.addressLine1?.trim() || profile.addressLine1;
        profile.addressLine2 = dto.addressLine2?.trim() || profile.addressLine2;
        profile.city = dto.city?.trim() || profile.city;
        profile.state = dto.state?.trim() || profile.state;
        profile.postalCode = dto.postalCode?.trim() || profile.postalCode;
        profile.emergencyContactName =
            dto.emergencyContactName?.trim() || profile.emergencyContactName;
        profile.emergencyContactPhone =
            dto.emergencyContactPhone?.trim() || profile.emergencyContactPhone;
        profile.emergencyContactRelationship =
            dto.emergencyContactRelationship?.trim() ||
            profile.emergencyContactRelationship;
        profile.facebook = dto.facebook?.trim() || profile.facebook;
        profile.bio = dto.bio?.trim() || profile.bio;
        profile.website = dto.website?.trim() || profile.website;
        profile.linkedin = dto.linkedin?.trim() || profile.linkedin;


        await profile.save();

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.UPDATE,
            resource: "PROFILE",
            resourceId: profile._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: "User profile updated successfully",
            ipAddress,
            metadata: {
                updatedFields: Object.keys(dto),
                location,
            },
        });

        return {
            success: true,
            message: "Profile Updated Success",
        };
    }
}
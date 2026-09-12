import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Institution, InstitutionDocument } from "./schema/institution.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "src/users/schemas/user.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { AuditLog, AuditLogDocument, AuditAction, AuditResult, AuditSeverity } from "src/audit/schemas/audit-log.schema";
import { Plan, PlanDocument } from "src/plans/schema/plan.schema";
import { EmailService } from "src/email/email.service";
import { auditlogService } from "src/audit/auditlog.service";
import { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";
import { CreateInstitutionDTO } from "./dto/create-institution.dto";
import { InstitutionData, InstitutionDataDocument } from "./schema/institutiondata.schema";
import { UpdateInstitutionDTO } from "./dto/update-institution.dto";

@Injectable()
export class InstitutionService {
    constructor(
        @InjectModel(Institution.name)
        private readonly institutionModel: Model<InstitutionDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Plan.name)
        private readonly planModel: Model<PlanDocument>,

        @InjectModel(InstitutionData.name)
        private readonly institutiondataModel: Model<InstitutionDataDocument>,

        private readonly emailService: EmailService,
        private readonly auditlogService: auditlogService,
    ) { }

    async CreateInstitution(
        user: AuthenticatedUser,
        dto: CreateInstitutionDTO,
        ipAddress: string,
        location: any,
    ) {
        const institution = await this.institutionModel.findOne({ name: dto.name })

        if (institution) {
            throw new ConflictException("The Institution Already in the System")
        }

        const institution_admin = await this.userModel.findById(dto.institution_admin).populate('roleId')

        if (!institution_admin) {
            throw new NotFoundException("The User Cannot Be Found");
        }

        if ((institution_admin.roleId as any)?.name !== "INSTITUTE_ADMIN") {
            throw new ConflictException("The User is Not INSTITUTE_ADMIN");
        }

        const plan = await this.planModel.findById(dto.plan_id);

        if (!plan || plan.isActive === false) {
            throw new NotFoundException("The Plan Cannot Be Found or Is Inactive");
        }

        const create_institution = await this.institutionModel.create({
            name: dto.name,
            institution_admin: institution_admin._id,
            plan: plan._id,
            code: dto.code,
            description: dto.description,
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2,
            phone: dto.phone,
            alternatePhone: dto.alternatePhone,
            active: true
        })

        institution_admin.institutionId = create_institution._id
        await institution_admin.save()

        await this.institutiondataModel.create({
            institution: create_institution._id
        })

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.CREATE,
            resource: "INSTITUTION",
            resourceId: create_institution._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: `User ${user.email} created Institution ${dto.name} successfully`,
            ipAddress,
            metadata: {
                updatedFields: Object.keys(dto),
                location,
            },
        });

        await this.emailService.sendNotificationEmail(
            institution_admin.email,
            institution_admin.email.replace("@gmail.com", ""),
            "Institution Created",
            `Your institution "${create_institution.name}" has been successfully created.`,
        )

        return {
            success: true,
            message: "Institution Created Success"
        }
    }

    async UpdateInstitution(
        user: AuthenticatedUser,
        institutionID: string,
        dto: UpdateInstitutionDTO,
        ipAddress: string,
        location: any
    ) {
        const institution = await this.institutionModel.findById(institutionID)

        if (!institution) {
            throw new NotFoundException("The Institution Cannot Be Found")
        }

        if (dto.name && dto.name !== institution.name) {
            const existingInstitution = await this.institutionModel.findOne({ name: dto.name, _id: { $ne: institutionID } })
            if (existingInstitution) {
                throw new ConflictException("The Institution Already in the System")
            }
        }

        if (dto.code && dto.code !== institution.code) {
            const existingInstitution = await this.institutionModel.findOne({ code: dto.code, _id: { $ne: institutionID } })

            if (existingInstitution) {
                throw new ConflictException("The Institution Code Already in the System")
            }
        }

        if (dto.institution_admin) {
            const institution_admin = await this.userModel.findById(dto.institution_admin).populate('roleId')

            if (!institution_admin) {
                throw new NotFoundException("The User Cannot Be Found")
            }

            if ((institution_admin.roleId as any)?.name !== "INSTITUTE_ADMIN") {
                throw new ConflictException("The User is Not INSTITUTE_ADMIN")
            }

            await this.userModel.findByIdAndUpdate(institution.institution_admin, { $unset: { institutionId: 1 } })

            institution_admin.institutionId = institution._id
            await institution_admin.save()

            institution.institution_admin = institution_admin._id
        }

        if (dto.plan_id) {
            const plan = await this.planModel.findById(dto.plan_id)

            if (!plan || plan.isActive === false) {
                throw new NotFoundException("The Plan Cannot Be Found or Is Inactive")
            }

            institution.plan = plan._id
        }

        if (dto.name !== undefined) institution.name = dto.name
        if (dto.code !== undefined) institution.code = dto.code
        if (dto.description !== undefined) institution.description = dto.description
        if (dto.addressLine1 !== undefined) institution.addressLine1 = dto.addressLine1
        if (dto.addressLine2 !== undefined) institution.addressLine2 = dto.addressLine2
        if (dto.phone !== undefined) institution.phone = dto.phone
        if (dto.alternatePhone !== undefined) institution.alternatePhone = dto.alternatePhone
        if (dto.active !== undefined) institution.active = dto.active

        await institution.save()

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.UPDATE,
            resource: "INSTITUTION",
            resourceId: institution._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: `User ${user.email} updated Institution ${institution.name} successfully`,
            ipAddress,
            metadata: {
                updatedFields: Object.keys(dto),
                location,
            },
        })

        return {
            success: true,
            message: "Institution Updated Successfully"
        }
    }

    async FetchInstitutions() {
        const institutions = await this.institutionModel.find().populate('institution_admin').populate('plan')

        return {
            success: true,
            message: "All Institution Fetched Success",
            result: institutions
        }
    }

    async FetchInstitutionByID (
        institutionID: string
    ) {
        const institution = await this.institutionModel.findById(institutionID).populate('institution_admin').populate('plan')

        if(!institution) {
            throw new NotFoundException("The Institution Cannot be found")
        }

        const institutiondata = await this.institutiondataModel.findOne({ institution: institution._id })

        if(!institutiondata) {
            throw new NotFoundException("Data for Institution Cannot be found")
        }

        return {
            success: true,
            message: "Institution Data Fetched success",
            result: [
                institution,
                institutiondata
            ]
        }        
    }
}
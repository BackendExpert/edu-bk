import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Plan, PlanDocument } from "./schema/plan.schema";
import { Model, Types } from "mongoose";
import { EmailService } from "src/email/email.service";
import { auditlogService } from "src/audit/auditlog.service";
import { AuditLog, AuditLogDocument, AuditAction, AuditResult, AuditSeverity } from "src/audit/schemas/audit-log.schema";
import { User, UserDocument } from "src/users/schemas/user.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { Institution, InstitutionDocument } from "src/institution/schema/institution.schema";
import { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";
import { CreatePlanDTO } from "./dto/create-plan.dto";
import { UpdatePlanDTO } from "./dto/update-plan.dto";


@Injectable()
export class PlanService {
    constructor(
        @InjectModel(Plan.name)
        private readonly planModel: Model<PlanDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        @InjectModel(Institution.name)
        private readonly institutionModel: Model<InstitutionDocument>,

        private readonly emailService: EmailService,
        private readonly auditlogService: auditlogService
    ) { }

    async CreatePlan(
        user: AuthenticatedUser,
        dto: CreatePlanDTO,
        ipAddress: string,
        location: any,
    ) {
        const plan = await this.planModel.findOne({ name: dto.name })
        if (plan) {
            throw new ConflictException("The Plan is Already Created")
        }

        const create_plan = await this.planModel.create({
            name: dto.name,
            description: dto.description,
            subtitle: dto.subtitle,
            type: dto.type,
            maxStudents: dto.maxStudents,
            maxBranches: dto.maxBranches,
            pricingType: dto.pricingType,
            monthlyPrice: dto.monthlyPrice,
            yearlyPrice: dto.yearlyPrice,
            isActive: dto.isActive,
            isPopular: dto.isPopular,
            features: dto.features,
            includedModules: dto.includedModules,
            aiFeatures: dto.aiFeatures,
        })

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.CREATE,
            resource: "PLAN",
            resourceId: create_plan._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: `User ${user.email} created Plan ${dto.name} successfully`,
            ipAddress,
            metadata: {
                updatedFields: Object.keys(dto),
                location,
            },
        });

        return {
            success: true,
            message: "Plan Created Success"
        }
    }

    async UpdatePlan(
        user: AuthenticatedUser,
        dto: UpdatePlanDTO,
        planId: string,
        ipAddress: string,
        location: any,
    ) {
        const plan = await this.planModel.findById(planId);

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        if (dto.name !== undefined) {
            plan.name = dto.name;
        }

        if (dto.description !== undefined) {
            plan.description = dto.description;
        }

        if (dto.subtitle !== undefined) {
            plan.subtitle = dto.subtitle;
        }

        if (dto.type !== undefined) {
            plan.type = dto.type;
        }

        if (dto.maxStudents !== undefined) {
            plan.maxStudents = dto.maxStudents;
        }

        if (dto.maxBranches !== undefined) {
            plan.maxBranches = dto.maxBranches;
        }

        if (dto.pricingType !== undefined) {
            plan.pricingType = dto.pricingType;
        }

        if (dto.monthlyPrice !== undefined) {
            plan.monthlyPrice = dto.monthlyPrice;
        }

        if (dto.yearlyPrice !== undefined) {
            plan.yearlyPrice = dto.yearlyPrice;
        }

        if (dto.isActive !== undefined) {
            plan.isActive = dto.isActive;
        }

        if (dto.isPopular !== undefined) {
            plan.isPopular = dto.isPopular;
        }

        if (dto.features !== undefined) {
            plan.features = dto.features;
        }

        if (dto.includedModules !== undefined) {
            plan.includedModules = dto.includedModules;
        }

        if (dto.aiFeatures !== undefined) {
            plan.aiFeatures = dto.aiFeatures;
        }

        plan.updatedBy = new Types.ObjectId(user.id);

        await plan.save();

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.UPDATE,
            resource: "PLAN",
            resourceId: plan._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: `User ${user.email} Update Plan ${dto.name} successfully`,
            ipAddress,
            metadata: {
                updatedFields: Object.keys(dto),
                location,
            },
        });

        return {
            success: true,
            message: "Plan Update Success"
        }
    }

    async FetchPlans() {
        const plans = await this.planModel.find()

        return {
            success: true,
            message: "All Plans Fetch Success",
            result: plans
        }
    }

    async FetchPublicPlans() {
        const publicPlans = await this.planModel.find({ isActive: true })

        return {
            success: true,
            message: "All Public Plans Fetch Success",
            result: publicPlans
        }
    }

    async FetchPlanById (
        plainID: string
    ) {
        const plan = await this.planModel.findById(plainID)

        if(!plan) {
            throw new NotFoundException("The Plan Cannot be found")
        }

        return {
            success: true,
            message: "Plan Fetched Success",
            result: plan
        }
    }
}
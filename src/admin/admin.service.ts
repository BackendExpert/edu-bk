import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Policy, PolicyDocument } from "src/abac/schema/policy.schema";
import { Permission, PermissionDocument } from "src/role/schema/permission.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePermissionDTO } from "./dto/update-permission.dto";
import { UpdatePolicyDTO } from "./dto/update-policy.dto";
import { AccountStatus, User, UserDocument } from "src/users/schemas/user.schema";
import { Profile, ProfileDocument } from "src/profile/schema/profile.schema";
import { AuditLog, AuditLogDocument, AuditAction, AuditResult, AuditSeverity } from "src/audit/schemas/audit-log.schema";
import { auditlogService } from "src/audit/auditlog.service";
import type { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        @InjectModel(Permission.name)
        private readonly permissionModel: Model<PermissionDocument>,

        @InjectModel(Policy.name)
        private readonly policyModel: Model<PolicyDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Profile.name)
        private readonly profileModel: Model<ProfileDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        private readonly auditlogService: auditlogService
    ) { }

    async CreateRole(
        dto: CreateRoleDTO
    ) {
        const name = dto.name.trim().toUpperCase();

        const existingRole = await this.roleModel.findOne({
            name,
        });

        if (existingRole) {
            throw new ConflictException(
                'Role already exists',
            );
        }

        const role = await this.roleModel.create({
            name,
            description: dto.description ?? null,
            permissions: [],
            isActive: dto.isActive ?? true,
        });

        return {
            success: true,
            message: 'Role created successfully',
            role,
        };
    }

    async createPermission(
        dto: CreatePermissionDto,
    ) {
        const name = dto.name.trim().toUpperCase();

        const existingPermission = await this.permissionModel.findOne({
            name,
        });

        if (existingPermission) {
            throw new ConflictException('Permission already exists');
        }

        const permission = await this.permissionModel.create({
            name,
            resource: dto.resource.trim(),
            action: dto.action.trim().toUpperCase(),
            description: dto.description ?? null,
            isActive: dto.isActive ?? true,
        });

        return {
            success: true,
            message: 'Permission created successfully',
            permission,
        };
    }

    async createPolicy(
        dto: CreatePolicyDto,
    ) {
        if (!Types.ObjectId.isValid(dto.permissionId)) {
            throw new NotFoundException('Invalid permission ID');
        }

        const permission = await this.permissionModel.findOne({
            _id: dto.permissionId,
            isActive: true,
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        const existingPolicy = await this.policyModel.findOne({
            name: dto.name.trim(),
        });

        if (existingPolicy) {
            throw new ConflictException('Policy already exists',);
        }

        const policy = await this.policyModel.create({
            name: dto.name.trim(),
            description: dto.description ?? null,
            permissionId: new Types.ObjectId(
                dto.permissionId,
            ),
            effect: dto.effect,
            version: dto.version ?? 1,
            conditions: dto.conditions ?? [],
            isActive: true,
        });

        return {
            success: true,
            message: 'Policy created successfully',
            policy,
        };
    }

    async assignPermissionToRole(
        roleId: string,
        permissionId: string,
    ) {
        if (!Types.ObjectId.isValid(roleId)) {
            throw new NotFoundException('Invalid role ID');
        }

        if (!Types.ObjectId.isValid(permissionId)) {
            throw new NotFoundException('Invalid permission ID');
        }

        const role = await this.roleModel.findOne({
            _id: roleId,
            isActive: true,
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        const permission = await this.permissionModel.findOne({
            _id: permissionId,
            isActive: true,
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        const alreadyAssigned = role.permissions.some((id) => id.toString() === permissionId);

        if (alreadyAssigned) {
            throw new ConflictException('Permission already assigned to this role');
        }

        role.permissions.push(new Types.ObjectId(permissionId));

        await role.save();

        return {
            success: true,
            message: 'Permission assigned to role successfully',
            role,
        };
    }

    async RemovePermission(
        roleId: string,
        permissionId: string,
    ) {
        if (!Types.ObjectId.isValid(roleId)) {
            throw new NotFoundException('Invalid role ID');
        }

        if (!Types.ObjectId.isValid(permissionId)) {
            throw new NotFoundException('Invalid permission ID');
        }

        const role = await this.roleModel.findOne({
            _id: roleId,
            isActive: true,
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        const permission = await this.permissionModel.findOne({
            _id: permissionId,
            isActive: true,
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        const permissionIndex = role.permissions.findIndex(
            (id) => id.toString() === permissionId,
        );

        if (permissionIndex === -1) {
            throw new NotFoundException('Permission is not assigned to this role');
        }

        role.permissions.splice(permissionIndex, 1);

        await role.save();

        return {
            success: true,
            message: 'Permission removed from role successfully',
            role,
        };
    }

    async togglePolicyStatus(
        policyId: string,
    ) {
        if (!Types.ObjectId.isValid(policyId)) {
            throw new NotFoundException('Invalid policy ID');
        }

        const policy = await this.policyModel.findOne({
            _id: policyId,
        });

        if (!policy) {
            throw new NotFoundException('Policy not found');
        }

        policy.isActive = !policy.isActive;

        await policy.save();

        return {
            success: true,
            message: policy.isActive
                ? 'Policy activated successfully'
                : 'Policy deactivated successfully',
            policy,
        };
    }

    async FetchAllPermissions() {
        const permissions = await this.permissionModel
            .find()
            .sort({
                name: 1,
            });

        return {
            success: true,
            result: permissions,
        };
    }

    async GetRoles() {
        const roles = await this.roleModel.find()

        return {
            success: true,
            result: roles
        }
    }

    async GetPolicies() {
        const policies = await this.policyModel.find().populate('permissionId')

        return {
            success: true,
            message: "Policies Fetched Success",
            result: policies
        }
    }

    async UpdatePermission(
        permissionId: string,
        dto: UpdatePermissionDTO,
    ) {
        const updateData: any = {};

        if (dto.name !== undefined) {
            updateData.name = dto.name.trim().toUpperCase();
        }

        if (dto.resource !== undefined) {
            updateData.resource = dto.resource.trim();
        }

        if (dto.action !== undefined) {
            updateData.action = dto.action.trim().toUpperCase();
        }

        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }

        if (dto.isActive !== undefined) {
            updateData.isActive = dto.isActive;
        }

        const permission = await this.permissionModel.findByIdAndUpdate(
            permissionId,
            { $set: updateData },
            { new: true },
        );

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        return {
            success: true,
            message: 'Permission updated successfully',
            permission,
        };
    }

    async UpdatePolicies(
        policyID: string,
        dto: UpdatePolicyDTO,
    ) {
        if (!Types.ObjectId.isValid(policyID)) {
            throw new NotFoundException('Invalid policy ID');
        }

        const existingPolicy = await this.policyModel.findById(policyID);

        if (!existingPolicy) {
            throw new NotFoundException('Policy not found');
        }

        if (dto.permissionId !== undefined) {
            if (!Types.ObjectId.isValid(dto.permissionId)) {
                throw new NotFoundException('Invalid permission ID');
            }

            const permission = await this.permissionModel.findOne({
                _id: dto.permissionId,
                isActive: true,
            });

            if (!permission) {
                throw new NotFoundException('Permission not found');
            }
        }

        if (dto.name !== undefined) {
            const existingPolicyName = await this.policyModel.findOne({
                name: dto.name.trim(),
                _id: { $ne: policyID },
            });

            if (existingPolicyName) {
                throw new ConflictException('Policy already exists');
            }
        }

        const updateData: any = {};

        if (dto.name !== undefined) {
            updateData.name = dto.name.trim();
        }

        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }

        if (dto.permissionId !== undefined) {
            updateData.permissionId = new Types.ObjectId(dto.permissionId);
        }

        if (dto.effect !== undefined) {
            updateData.effect = dto.effect;
        }

        if (dto.version !== undefined) {
            updateData.version = dto.version;
        }

        if (dto.conditions !== undefined) {
            updateData.conditions = dto.conditions;
        }

        const policy = await this.policyModel.findByIdAndUpdate(
            policyID,
            { $set: updateData },
            { new: true },
        );

        return {
            success: true,
            message: 'Policy updated successfully',
            policy,
        };
    }

    async FetchUsers() {
        const users = await this.userModel.find().populate('roleId').populate('institutionId')

        return {
            success: true,
            message: "All users Fetched Success",
            result: users
        }
    }

    async FetchUserByID(
        userId: string
    ) {
        const user = await this.userModel.findById(userId).populate('roleId').populate('institutionId')

        if (!user) {
            throw new NotFoundException("The User Cannot be found")
        }

        const profile = await this.profileModel.findOne({ userId: user._id })

        if (!profile) {
            throw new NotFoundException("The Profile Not Found by Currnt User")
        }

        const auditlog = await this.auditlogModel.find({ userId: user._id })

        return {
            success: true,
            message: "User Data Fetched Success",
            result: [
                user,
                profile,
                auditlog
            ]
        }
    }

    async UpdateUserStatus(
        user: AuthenticatedUser,
        userId: string,
        ipAddress: string,
        location: any,
    ) {
        const targetUser = await this.userModel.findById(userId)

        if (!targetUser) {
            throw new ConflictException("User Cannot be Found")
        }

        const updateuser = await this.userModel.findByIdAndUpdate(
            userId,
            {
                accountStatus: targetUser.accountStatus === AccountStatus.ACTIVE
                    ? AccountStatus.LOCKED
                    : AccountStatus.ACTIVE
            },
            { new: true }
        )

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.UPDATE,
            resource: "PROFILE",
            resourceId: targetUser._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: `User Stats Updated Success By ${user.email}`,
            ipAddress,
            metadata: {
                location,
            },
        });

        return {
            success: true,
            message: "User Stats Updated Successfully"
        }
    }

    async UpdateUserRole(
        user: AuthenticatedUser,
        userId: string,
        role: string,
        ipAddress: string,
        location: any,
    ) {
        const targetUser = await this.userModel.findById(userId)
        
        if(!targetUser) {
            throw new NotFoundException("The Target User Cannot be found")
        }

        const rolecheck = await this.roleModel.findById(role)

        if (!rolecheck) {
            throw new NotFoundException("The Role cannot be found")
        }

        const update_user_role = await this.userModel.findByIdAndUpdate(
            userId,
            {
                roleId: rolecheck._id
            },
            { new: true }
        )

        await this.auditlogService.create({
            userId: user.id,
            action: AuditAction.UPDATE,
            resource: "PROFILE",
            resourceId: targetUser._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: `User Role Updated Success By ${user.email}`,
            ipAddress,
            metadata: {
                location,
            },
        });

        return {
            success: true,
            message: "User Role Updated Successfully"
        }
    }

    async FetchAuditlogs () {
        const auditlogs = await this.auditlogModel.find().populate('userId')

        return {
            success: true,
            message: "Audit Logs Fetched Success",
            result: auditlogs
        }
    }

    async FetchAuditlogbyID (
        auditlogID: string
    ) {
        const auditlog = await this.auditlogModel.findById(auditlogID).populate('userId')

        if(!auditlog){
            throw new NotFoundException("The AuditLog Cannot be found")
        }

        return {
            success: true,
            message: "Auditlog Fetched Success",
            result: auditlog
        }
        
    }
}
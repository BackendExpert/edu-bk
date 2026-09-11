import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { CreateRoleDTO } from "./dto/create-role.dto";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { UpdatePermissionDTO } from "./dto/update-permission.dto";
import { UpdatePolicyDTO } from "./dto/update-policy.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";
import { getClientIp, getLocationFromIp } from "src/common/utils/location.util";
import type { Request } from "express";

@Controller('/api/v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    private checkSuperAdmin(
        request: any,
    ) {
        const user = request.user as {
            role?: string;
        };

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        if (user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only SUPER_ADMIN can perform this action');
        }
    }

    @Post('/roles')
    async createRole(
        @Req() request: Request,
        @Body() dto: CreateRoleDTO,
    ) {
        this.checkSuperAdmin(request);

        return this.adminService.CreateRole(
            dto,
        );
    }

    @Post('/permissions')
    async createPermission(
        @Req() request: Request,
        @Body() dto: CreatePermissionDto,
    ) {
        this.checkSuperAdmin(request);

        return this.adminService.createPermission(
            dto,
        );
    }

    @Get('/permissions')
    async GetPermissions(
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request);
        return this.adminService.FetchAllPermissions()
    }

    @Post('/policies')
    async createPolicy(
        @Req() request: Request,
        @Body() dto: CreatePolicyDto,
    ) {
        this.checkSuperAdmin(request);

        return this.adminService.createPolicy(
            dto,
        );
    }

    @Post('/roles/:roleId/permissions/:permissionId')
    async assignPermissionToRole(
        @Req() request: Request,
        @Param('roleId') roleId: string,
        @Param('permissionId') permissionId: string,
    ) {
        this.checkSuperAdmin(request);

        return this.adminService.assignPermissionToRole(
            roleId,
            permissionId,
        );
    }

    @Delete('/roles/:roleId/permissions/:permissionId')
    async RemovePermissions(
        @Req() request: Request,
        @Param('roleId') roleId: string,
        @Param('permissionId') permissionId: string,
    ) {
        this.checkSuperAdmin(request);

        return this.adminService.RemovePermission(
            roleId,
            permissionId,
        );
    }

    @Post('/policies/:policyId/toggle')
    async togglePolicyStatus(
        @Req() request: Request,
        @Param('policyId') policyId: string,
    ) {
        this.checkSuperAdmin(request);

        return this.adminService.togglePolicyStatus(
            policyId,
        );
    }

    @Get('/roles')
    async FetchRoles(
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request);
        return this.adminService.GetRoles()
    }

    @Get('/policy')
    async FetchPolicy(
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request);
        return this.adminService.GetPolicies()
    }

    @Patch('/permission/:id')
    async UpdatePermssion(
        @Req() request: Request,
        @Param('id') permssionID: string,
        @Body() dto: UpdatePermissionDTO,
    ) {
        this.checkSuperAdmin(request);
        return this.adminService.UpdatePermission(
            permssionID,
            dto
        )
    }

    @Patch('/policy/:id')
    async UpdatePolicy(
        @Req() request: Request,
        @Param('id') policyID: string,
        @Body() dto: UpdatePolicyDTO,
    ) {
        this.checkSuperAdmin(request);
        return this.adminService.UpdatePolicies(
            policyID,
            dto
        )
    }

    @Get('/users')
    async Fetchusers(
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request);
        return this.adminService.FetchUsers()
    }

    @Get('/user/:id')
    async FetchUserByID(
        @Req() request: Request,
        @Param('id') userId: string
    ) {
        this.checkSuperAdmin(request)
        return this.adminService.FetchUserByID(userId)
    }

    @Patch('/update-user-stats/:id')
    async UpdateUserStatus(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') userId: string,
        @Req() request: Request,
    ) {
        const ipAddress = getClientIp(request);
        const location = await getLocationFromIp(request);

        this.checkSuperAdmin(request)
        return this.adminService.UpdateUserStatus(user, userId, ipAddress, location)
    }

    @Patch('/user-role-update/:id')
    async UserRoleUpdate (
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') userId: string,
        @Body('role') role: string,
        @Req() request: Request,
    ) {
        const ipAddress = getClientIp(request);
        const location = await getLocationFromIp(request);

        this.checkSuperAdmin(request)
        return this.adminService.UpdateUserRole(user, userId, role, ipAddress, location)
    }

}
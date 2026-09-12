import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { AbacGuard } from "src/common/guard/abac.guard";
import { AbacPermission } from "src/common/decorators/abac.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";
import { CreatePlanDTO } from "./dto/create-plan.dto";
import { getClientIp, getLocationFromIp } from "src/common/utils/location.util";
import type { Request } from "express";

@Controller('api/v1/plan')
export class PlanController {
    constructor(
        private readonly planService: PlanService
    ) { }

    private checkSuperAdminorStaff(
        request: any,
    ) {
        const user = request.user as { role?: string; };

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF') {
            throw new ForbiddenException('Only SUPER_ADMIN or STAFF can perform this action');
        }
    }

    @Post('/create-plan')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('CREATE_PLAN')
    async CreatePlan(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreatePlanDTO,
        @Req() request: Request,
    ) {
        this.checkSuperAdminorStaff(request)
        const ipAddress = getClientIp(request)
        const location = await getLocationFromIp(request)

        return this.planService.CreatePlan(user, dto, ipAddress, location)
    }

    @Patch('/update-plan/:id')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission("UPDATE_PLAN")
    async UpdatePlan(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreatePlanDTO,
        @Param('id') planID: string,
        @Req() request: Request,
    ) {
        this.checkSuperAdminorStaff(request)
        const ipAddress = getClientIp(request)
        const location = await getLocationFromIp(request)

        return this.planService.UpdatePlan(user, dto, planID, ipAddress, location)
    }

    @Get('/fetch-plans')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('FETCH_PLANS')
    async FetchPlans(
        @Req() request: Request,
    ) {
        this.checkSuperAdminorStaff(request)

        return this.planService.FetchPlans()
    }

    @Get('/public-plans')
    async FetchPublicPlans(
        @Req() request: Request,
    ) {
        return this.planService.FetchPublicPlans()
    }

    @Get('/fetch-plan-byid/:id')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('FETCH_PLAN_BY_ID')
    async FetchPlanByID(
        @Param('id') id: string,
        @Req() request: Request,
    ) {
        this.checkSuperAdminorStaff(request)
        return this.planService.FetchPlanById(id)
    }
}
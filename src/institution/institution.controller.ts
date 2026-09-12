import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { InstitutionService } from "./institution.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { AbacGuard } from "src/common/guard/abac.guard";
import { AbacPermission } from "src/common/decorators/abac.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "src/common/interfaces/authenticated-user.interface";
import { CreateInstitutionDTO } from "./dto/create-institution.dto";
import { getClientIp, getLocationFromIp } from "src/common/utils/location.util";
import type { Request } from "express";

@Controller('api/v1/institution')
export class InstitutionController {
    constructor(
        private readonly institutionService: InstitutionService
    ) { }

    private checkSuperAdmin(
        request: any,
    ) {
        const user = request.user as { role?: string; };

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        if (user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only SUPER_ADMIN can perform this action');
        }
    }

    @Post('/create-institution')
    @UseGuards(JwtAuthGuard, AbacGuard)
    async CreateInstitution(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateInstitutionDTO,
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request)
        const ipAddress = getClientIp(request)
        const location = await getLocationFromIp(request)

        return this.institutionService.CreateInstitution(
            user,
            dto,
            ipAddress,
            location
        )
    }

    @Patch('/update-institution/:id')
    @UseGuards(JwtAuthGuard, AbacGuard)
    async UpdateInstitution(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') institutionID: string,
        @Body() dto: CreateInstitutionDTO,
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request)
        const ipAddress = getClientIp(request)
        const location = await getLocationFromIp(request)

        return this.institutionService.UpdateInstitution(
            user,
            institutionID,
            dto,
            ipAddress,
            location
        )
    }

    @Get('/fetch-all')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('FETCH_ALL_INSTITUTION')
    async Fetchallinstitutions() {
        return this.institutionService.FetchInstitutions()
    }

    @Get('/fetch-by-id/:id')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('FETCH_ALL_INSTITUTION')
    async FetchinstitutionByID(
        @Param('id') institutionId: string
    ) {
        return this.institutionService.FetchInstitutionByID(institutionId)
    }
}
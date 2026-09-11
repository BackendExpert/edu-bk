import { Body, Controller, ForbiddenException, Get, Put, Req, UseGuards } from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { UpdateRateLimitDto } from "./dto/update-rate-limit.dto";

@Controller('/api/v1/admin/rate-limit')
@UseGuards(JwtAuthGuard)

export class RateLimitController {
    constructor(
        private readonly ratelimitService: RateLimitService
    ) { }

    private checkSuperAdmin(
        request: any
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

    @Get()
    async getRateLimit(
        @Req() request: Request,
    ) {
        this.checkSuperAdmin(request);
        return this.ratelimitService.getCurrentConfiguration();
    }

    @Put()
    async updateRateLimit(
        @Req() request: Request,
        @Body() dto: UpdateRateLimitDto,
    ) {
        this.checkSuperAdmin(request);
        return this.ratelimitService.updateRateLimit(dto);
    }
}
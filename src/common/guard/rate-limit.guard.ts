import {
    CanActivate,
    ExecutionContext,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { RateLimitService } from 'src/ratelimit/rate-limit.service';


interface RateLimitRecord {
    count: number;
    resetAt: number;
}

@Injectable()
export class RateLimitGuard
    implements CanActivate {

    private readonly requests = new Map<string, RateLimitRecord>();

    constructor(
        private readonly rateLimitService:
            RateLimitService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request =
            context.switchToHttp().getRequest();

        const user = request.user;

        if (!user) {
            return true;
        }

        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        const userId = user.userId;

        if (!userId) { return true; }

        const configuration = await this.rateLimitService.getCurrentConfiguration();

        if (!configuration.isActive) {
            return true;
        }

        const now = Date.now();

        const existing = this.requests.get(userId);

        if (!existing || now >= existing.resetAt) {
            this.requests.set(userId, {
                count: 1,
                resetAt: now + configuration.windowSeconds * 1000,
            });

            return true;
        }

        if (existing.count >= configuration.limit) {
            throw new BadRequestException('Rate limit exceeded. Please try again later.',);
        }

        existing.count++;

        return true;
    }
}
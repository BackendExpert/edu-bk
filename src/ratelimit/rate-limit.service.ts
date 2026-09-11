import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { RateLimit, RateLimitDocument } from "./schema/rateLimit.schema";
import { Model } from "mongoose";
import { UpdateRateLimitDto } from "./dto/update-rate-limit.dto";

@Injectable()
export class RateLimitService {
    private readonly defaultName = 'DEFAULT_API_RATE_LIMIT';

    constructor(
        @InjectModel(RateLimit.name)
        private readonly ratelimitModel: Model<RateLimitDocument>,
    ) { }

    async getRateLimit() {
        let ratelimit = await this.ratelimitModel.findOne({ name: this.defaultName })

        if (!ratelimit) {
            ratelimit = await this.ratelimitModel.create({
                name: this.defaultName,
                limit: 100,
                windowSeconds: 60,
                isActive: true
            })
        }

        return ratelimit
    }
    async updateRateLimit(
        dto: UpdateRateLimitDto,
    ) {
        const rateLimit = await this.getRateLimit();

        if (dto.name !== undefined) {
            rateLimit.name = dto.name.trim();
        }

        if (dto.limit !== undefined) {
            rateLimit.limit = dto.limit;
        }

        if (dto.windowSeconds !== undefined) {
            rateLimit.windowSeconds = dto.windowSeconds;
        }

        if (dto.isActive !== undefined) {
            rateLimit.isActive = dto.isActive;
        }

        await rateLimit.save();

        return {
            success: true,
            message: 'Rate limit updated successfully',
            rateLimit,
        };
    }

    async getCurrentConfiguration() {
        return this.getRateLimit();
    }   
}
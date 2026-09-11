import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    RateLimit,
    RateLimitSchema,
} from './schema/rateLimit.schema';
import { RateLimitService } from './rate-limit.service';
import { RateLimitController } from './rate-limit.controller';
import { RateLimitGuard } from 'src/common/guard/rate-limit.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: RateLimit.name, schema: RateLimitSchema, },
        ]),
    ],
    controllers: [RateLimitController,],
    providers: [RateLimitService, RateLimitGuard,],
    exports: [RateLimitService, RateLimitGuard,],
})
export class RateLimitModule { }
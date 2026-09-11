import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RateLimitDocument = HydratedDocument<RateLimit>;

@Schema({ timestamps: true, collection: 'rate_limits' })
export class RateLimit {
    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop({ required: true, min: 1, default: 100 })
    limit!: number;

    @Prop({ required: true, min: 1, default: 60 })
    windowSeconds!: number;

    @Prop({ default: true })
    isActive!: boolean;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);

RateLimitSchema.index({ isActive: 1 });
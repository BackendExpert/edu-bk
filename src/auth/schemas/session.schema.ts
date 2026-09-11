import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true, collection: 'sessions' })
export class Session {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    refreshTokenHash!: string;

    @Prop({ type: Date, default: null })
    expiresAt!: Date | null;

    @Prop({ type: Date, default: null })
    revokedAt!: Date | null;

    @Prop({ type: String, default: null, trim: true })
    ipAddress!: string | null;

    @Prop({ type: String, default: null, trim: true })
    userAgent!: string | null;

    @Prop({ type: String, default: null, trim: true })
    deviceId!: string | null;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: Date, default: null })
    lastUsedAt!: Date | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
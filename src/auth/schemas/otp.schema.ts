import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

export enum OtpPurpose {
    LOGIN = 'LOGIN',
    PASSWORD_RESET = 'PASSWORD_RESET',
    SENSITIVE_ACTION = 'SENSITIVE_ACTION',
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

@Schema({ timestamps: true, collection: 'otp_verifications' })
export class Otp {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true })
    codeHash!: string;

    @Prop({ required: true, enum: OtpPurpose })
    purpose!: OtpPurpose;

    @Prop({ required: true })
    expiresAt!: Date;
    
    @Prop({ default: 0 })
    attempts!: number;

    @Prop({ type: Date, default: null })
    verifiedAt!: Date | null;

    @Prop({ default: true })
    isActive!: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ userId: 1, purpose: 1, isActive: 1 });
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmailVerificationDocument = HydratedDocument<EmailVerification>;

@Schema({ timestamps: true, collection: 'email_verifications' })
export class EmailVerification {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    tokenHash!: string;

    @Prop({ required: true })
    expiresAt!: Date;
    
    @Prop({ type: Date, default: null })
    usedAt!: Date | null;
}

export const EmailVerificationSchema = SchemaFactory.createForClass(EmailVerification);

EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
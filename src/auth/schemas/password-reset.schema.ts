import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PasswordResetDocument = HydratedDocument<PasswordReset>;

@Schema({ timestamps: true, collection: 'password_resets' })
export class PasswordReset {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    tokenHash!: string;

    @Prop({ required: true })
    expiresAt!: Date;

    @Prop({ type: Date, default: null })
    usedAt!: Date | null;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
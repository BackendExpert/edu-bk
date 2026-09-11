import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BackupCodeDocument = HydratedDocument<BackupCode>;

@Schema({ timestamps: true, collection: 'backup_codes' })
export class BackupCode {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true })
    codeHash!: string;

    @Prop({ type: Date, default: null })
    usedAt!: Date | null;

    @Prop({ default: true })
    isActive!: boolean;
}

export const BackupCodeSchema = SchemaFactory.createForClass(BackupCode);

BackupCodeSchema.index({ userId: 1, isActive: 1 });
BackupCodeSchema.index({ userId: 1, codeHash: 1 }, { unique: true });
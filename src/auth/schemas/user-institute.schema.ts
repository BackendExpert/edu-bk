import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserInstitutionDocument = HydratedDocument<UserInstitution>;

@Schema({ timestamps: true, collection: 'user_institutions' })
export class UserInstitution {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Institution', index: true })
    institutionId!: Types.ObjectId;

    @Prop({ required: true, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE', index: true })
    status!: string;
}

export const UserInstitutionSchema = SchemaFactory.createForClass(UserInstitution);

UserInstitutionSchema.index({ userId: 1, institutionId: 1 }, { unique: true });
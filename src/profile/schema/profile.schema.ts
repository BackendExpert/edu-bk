import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ timestamps: true, collection: 'profiles' })
export class Profile {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
    userId!: Types.ObjectId;

    @Prop({ trim: true })
    firstName!: string;

    @Prop({ trim: true })
    lastName!: string;

    @Prop({ type: String, default: null, trim: true })
    middleName!: string | null;

    @Prop({ type: String, default: null, trim: true })
    displayName!: string | null;

    @Prop({ type: String, default: null, trim: true })
    title!: string | null;

    @Prop({ type: Date, default: null })
    dateOfBirth!: Date | null;

    @Prop({ type: String, default: null, trim: true })
    gender!: string | null;

    @Prop({ type: String, default: null, trim: true })
    nic!: string | null;

    @Prop({ type: String, default: null, trim: true })
    passportNumber!: string | null;

    @Prop({ type: String, default: null, trim: true })
    nationality!: string | null;

    @Prop({ type: String, default: null, trim: true })
    phone!: string | null;

    @Prop({ type: String, default: null, trim: true })
    alternatePhone!: string | null;

    @Prop({ type: String, default: null, trim: true })
    addressLine1!: string | null;

    @Prop({ type: String, default: null, trim: true })
    addressLine2!: string | null;

    @Prop({ type: String, default: null, trim: true })
    city!: string | null;

    @Prop({ type: String, default: null, trim: true })
    state!: string | null;

    @Prop({ type: String, default: null, trim: true })
    postalCode!: string | null;

    @Prop({ trim: true })
    profileImage!: string;

    @Prop({ type: String, default: null, trim: true })
    emergencyContactName!: string | null;

    @Prop({ type: String, default: null, trim: true })
    emergencyContactPhone!: string | null;

    @Prop({ type: String, default: null, trim: true })
    emergencyContactRelationship!: string | null;

    @Prop({ type: String, default: null, trim: true })
    facebook!: string | null;

    @Prop({ type: String, default: null, trim: true })
    bio!: string | null;

    @Prop({ type: String, default: null, trim: true })
    website!: string | null;

    @Prop({ type: String, default: null, trim: true })
    linkedin!: string | null;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({ nic: 1 }, { sparse: true });
ProfileSchema.index({ passportNumber: 1 }, { sparse: true });
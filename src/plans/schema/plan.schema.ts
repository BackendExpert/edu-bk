import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlanDocument = HydratedDocument<Plan>;

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop({ required: true, trim: true })
    description!: string;

    @Prop({ required: true, trim: true })
    subtitle!: string;

    @Prop({ required: true, enum: ['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'] })
    type!: string;

    @Prop({ required: true, min: 1 })
    maxStudents!: number;

    @Prop({ required: true, default: 1, min: 1, max: 1 })
    maxBranches!: number;

    @Prop({ required: true, enum: ['CONTACT', 'CUSTOM'], default: 'CONTACT' })
    pricingType!: string;

    @Prop({ required: false, min: 0 })
    monthlyPrice?: number;

    @Prop({ required: false, min: 0 })
    yearlyPrice?: number;

    @Prop({ required: true, default: true })
    isActive!: boolean;

    @Prop({ required: true, default: false })
    isPopular!: boolean;

    @Prop({ type: [String], default: [] })
    features!: string[];

    @Prop({ type: [String], default: [] })
    includedModules!: string[];

    @Prop({ type: [String], default: [] })
    aiFeatures!: string[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    createdBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    updatedBy?: Types.ObjectId;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
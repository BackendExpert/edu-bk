import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PolicyDocument = HydratedDocument<Policy>;

export enum PolicyEffect {
    ALLOW = 'ALLOW',
    DENY = 'DENY',
}

export enum PolicyOperator {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    EXISTS = 'EXISTS',
    NOT_EXISTS = 'NOT_EXISTS',
    CONTAINS = 'CONTAINS',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    GREATER_THAN = 'GREATER_THAN',
    GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
    LESS_THAN = 'LESS_THAN',
    LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
}

@Schema({ _id: false })
export class PolicyCondition {
    @Prop({ required: true, type: String, trim: true, })
    attribute!: string;

    @Prop({ required: true, type: String, enum: PolicyOperator, })
    operator!: PolicyOperator;

    @Prop({ type: Object, required: true })
    value!: unknown;
}

export const PolicyConditionSchema = SchemaFactory.createForClass(PolicyCondition);

@Schema({ timestamps: true, collection: 'policies' })
export class Policy {
    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop({ default: null, type: String, trim: true, })
    description!: string | null;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Permission', })
    permissionId!: Types.ObjectId;

    @Prop({ required: true, enum: PolicyEffect, })
    effect!: PolicyEffect;

    @Prop({ default: true, type: Boolean, })
    isActive!: boolean;

    @Prop({ required: true, default: 1, type: Number, })
    version!: number;

    @Prop({ type: [PolicyConditionSchema], default: [], })
    conditions!: PolicyCondition[];
}

export const PolicySchema = SchemaFactory.createForClass(Policy);

PolicySchema.index({ permissionId: 1, isActive: 1, });
PolicySchema.index({ effect: 1, isActive: 1, });
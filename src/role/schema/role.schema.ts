import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop({ type: String, default: null, trim: true })
    description!: string | null;

    @Prop({ type: [Types.ObjectId], ref: 'Permission', default: [] })
    permissions!: Types.ObjectId[];

    @Prop({ default: true })
    isActive!: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ isActive: 1 });
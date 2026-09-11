import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true, collection: 'permissions' })
export class Permission {
    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop({ required: true, trim: true })
    resource!: string;

    @Prop({ required: true, trim: true })
    action!: string;

    @Prop({ default: null, type: String, trim: true })
    description!: string | null;

    @Prop({ default: true })
    isActive!: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ isActive: 1 });
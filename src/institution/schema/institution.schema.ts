import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InstitutionDocument = HydratedDocument<Institution>;

@Schema({ timestamps: true, collection: 'institutions', versionKey: false })
export class Institution {
    @Prop({ required: true, unique: true, trim: true, minlength: 2, maxlength: 150 })
    name!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true, minlength: 2, maxlength: 50 })
    code!: string;

    @Prop({ trim: true, maxlength: 150 })
    description?: string;

    @Prop({ trim: true, maxlength: 150 })
    addressLine1?: string;

    @Prop({ trim: true, maxlength: 150 })
    addressLine2?: string;

    @Prop({ trim: true, maxlength: 20 })
    phone?: string;

    @Prop({ trim: true, maxlength: 20 })
    alternatePhone?: string;

    @Prop({ default: true, index: true })
    active!: boolean;
}

export const InstitutionSchema = SchemaFactory.createForClass(Institution);

InstitutionSchema.index({ name: 1 });
InstitutionSchema.index({ code: 1 });
InstitutionSchema.index({ active: 1 });
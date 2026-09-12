import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InstitutionDataDocument = HydratedDocument<InstitutionData>;

@Schema({ timestamps: true, collection: 'institution_data', versionKey: false })
export class InstitutionData {
    @Prop({ type: Types.ObjectId, ref: 'Institution' })
    institution!: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    total_students!: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    total_teachers!: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    total_staff!: Types.ObjectId[];
}

export const InstitutionDataSchema = SchemaFactory.createForClass(InstitutionData);
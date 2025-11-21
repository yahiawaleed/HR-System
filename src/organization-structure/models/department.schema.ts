import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Position } from './position.schema';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ collection: 'departments', timestamps: true })
export class Department {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: Position.name })
  headPositionId?: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

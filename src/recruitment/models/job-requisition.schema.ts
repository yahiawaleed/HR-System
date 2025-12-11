import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class JobRequisition {

  @Prop({ required: false, default: () => `REQ-${Date.now()}` })
  requisitionId: string;

  @Prop({ type: Types.ObjectId, ref: 'JobTemplate' })
  templateId: Types.ObjectId;

  @Prop({ required: false, default: 1 })
  openings: number;

  @Prop()
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  hiringManagerId: Types.ObjectId;

  @Prop({
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  })
  publishStatus: string;

  @Prop()
  postingDate?: Date;

  @Prop()
  expiryDate?: Date;
}

export type JobRequisitionDocument = HydratedDocument<JobRequisition>;
export const JobRequisitionSchema = SchemaFactory.createForClass(JobRequisition);

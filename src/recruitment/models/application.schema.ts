import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApplicationStage } from '../enums/application-stage.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

@Schema({ timestamps: true })
export class Application {

  @Prop({ type: String, required: false })
  candidateId: string;

  @Prop({ type: String, required: false })
  requisitionId: string;

  @Prop({ type: String, required: false })
  assignedHr?: string;

  @Prop({
    enum: ApplicationStage,
    default: ApplicationStage.SCREENING
  })
  currentStage: ApplicationStage;

  @Prop({
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED
  })
  status: ApplicationStatus;
}

export type ApplicationDocument = HydratedDocument<Application>;
export const ApplicationSchema = SchemaFactory.createForClass(Application);
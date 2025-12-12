import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
    STATUS_CHANGE = 'STATUS_CHANGE',
    ROLE_ASSIGNED = 'ROLE_ASSIGNED',
    REQUEST_APPROVED = 'REQUEST_APPROVED',
    REQUEST_REJECTED = 'REQUEST_REJECTED',
    EMPLOYEE_CREATED = 'EMPLOYEE_CREATED',
    CANDIDATE_STATUS_CHANGED = 'CANDIDATE_STATUS_CHANGED',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    // Performance
    APPRAISAL_ASSIGNED = 'APPRAISAL_ASSIGNED',
    APPRAISAL_PUBLISHED = 'APPRAISAL_PUBLISHED',
    APPRAISAL_DISPUTE = 'APPRAISAL_DISPUTE',
    // Org Structure
    STRUCTURE_CHANGE = 'STRUCTURE_CHANGE',
    STRUCTURE_REQUEST = 'STRUCTURE_REQUEST',
}

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
    recipientId: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(NotificationType),
        required: true,
    })
    type: NotificationType;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    message: string;

    @Prop({ type: String })
    relatedEntityType?: string;

    @Prop({ type: Types.ObjectId })
    relatedEntityId?: Types.ObjectId;

    @Prop({ type: String })
    actionUrl?: string;

    @Prop({ type: Boolean, default: false })
    isRead: boolean;

    @Prop({ type: Date })
    readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './models/notification.schema';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,
    ) { }

    async createNotification(createDto: CreateNotificationDto): Promise<Notification> {
        const notification = new this.notificationModel({
            recipientId: new Types.ObjectId(createDto.recipientId),
            type: createDto.type,
            title: createDto.title,
            message: createDto.message,
            relatedEntityType: createDto.relatedEntityType,
            relatedEntityId: createDto.relatedEntityId
                ? new Types.ObjectId(createDto.relatedEntityId)
                : undefined,
            isRead: false,
        });

        return notification.save();
    }

    async getNotifications(
        userId: string,
        page = 1,
        limit = 10,
        onlyUnread = false,
    ): Promise<{
        data: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        unreadCount: number;
    }> {
        const filter: any = { recipientId: new Types.ObjectId(userId) };
        if (onlyUnread) {
            filter.isRead = false;
        }

        const skip = (page - 1) * limit;
        const [data, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.notificationModel.countDocuments(filter).exec(),
            this.notificationModel.countDocuments({
                recipientId: new Types.ObjectId(userId),
                isRead: false
            }).exec(),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            unreadCount,
        };
    }

    async markAsRead(notificationId: string): Promise<Notification> {
        const notification = await this.notificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true, readAt: new Date() },
            { new: true },
        ).exec();

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${notificationId} not found`);
        }

        return notification;
    }

    async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
        const result = await this.notificationModel.updateMany(
            { recipientId: new Types.ObjectId(userId), isRead: false },
            { isRead: true, readAt: new Date() },
        ).exec();

        return { modifiedCount: result.modifiedCount };
    }

    async deleteNotification(notificationId: string): Promise<void> {
        const result = await this.notificationModel.findByIdAndDelete(notificationId).exec();
        if (!result) {
            throw new NotFoundException(`Notification with ID ${notificationId} not found`);
        }
    }

    // Helper method to create system notifications
    async notifyStatusChange(employeeId: string, oldStatus: string, newStatus: string): Promise<void> {
        await this.createNotification({
            recipientId: employeeId,
            type: NotificationType.STATUS_CHANGE,
            title: 'Status Changed',
            message: `Your employment status has been changed from ${oldStatus} to ${newStatus}`,
            relatedEntityType: 'EmployeeProfile',
            relatedEntityId: employeeId,
        });
    }

    async notifyRoleAssigned(employeeId: string, roles: string[]): Promise<void> {
        await this.createNotification({
            recipientId: employeeId,
            type: NotificationType.ROLE_ASSIGNED,
            title: 'Roles Updated',
            message: `Your system roles have been updated: ${roles.join(', ')}`,
            relatedEntityType: 'EmployeeSystemRole',
            relatedEntityId: employeeId,
        });
    }

    async notifyRequestApproved(employeeId: string, requestId: string, requestType: string): Promise<void> {
        await this.createNotification({
            recipientId: employeeId,
            type: NotificationType.REQUEST_APPROVED,
            title: 'Request Approved',
            message: `Your ${requestType} request has been approved`,
            relatedEntityType: 'ChangeRequest',
            relatedEntityId: requestId,
        });
    }

    async notifyRequestRejected(employeeId: string, requestId: string, requestType: string): Promise<void> {
        await this.createNotification({
            recipientId: employeeId,
            type: NotificationType.REQUEST_REJECTED,
            title: 'Request Rejected',
            message: `Your ${requestType} request has been rejected`,
            relatedEntityType: 'ChangeRequest',
            relatedEntityId: requestId,
        });
    }
}

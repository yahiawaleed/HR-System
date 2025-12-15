import { api } from './api';

export interface Notification {
    _id: string;
    recipientId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationsResponse {
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
}

export const notificationsService = {
    // Get notifications
    getNotifications: async (page = 1, limit = 10, onlyUnread = false): Promise<NotificationsResponse> => {
        const response = await api.get(`/api/notifications?page=${page}&limit=${limit}&onlyUnread=${onlyUnread}`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<Notification> => {
        const response = await api.patch(`/api/notifications/${notificationId}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
        const response = await api.patch('/api/notifications/read-all');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (notificationId: string): Promise<void> => {
        await api.delete(`/api/notifications/${notificationId}`);
    },
};

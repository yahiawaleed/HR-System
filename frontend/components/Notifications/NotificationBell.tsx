'use client';

import { useState, useEffect } from 'react';
import { notificationsService, Notification } from '@/services/notificationsService';
import { Bell, X } from 'lucide-react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsService.getNotifications(1, 10);
            setNotifications(response.data);
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationsService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationsService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            const deleted = notifications.find(n => n._id === notificationId);
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                    color: 'inherit',
                }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        minWidth: '18px',
                        textAlign: 'center',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998,
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '380px',
                        maxHeight: '500px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                        zIndex: 999,
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#3b82f6',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={handleMarkAllAsRead}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
                            {loading ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                                    No notifications
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification._id}
                                        style={{
                                            display: 'flex',
                                            padding: '16px 20px',
                                            borderBottom: '1px solid #f3f4f6',
                                            transition: 'background-color 0.2s',
                                            gap: '12px',
                                            backgroundColor: !notification.isRead ? '#eff6ff' : 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = !notification.isRead ? '#dbeafe' : '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = !notification.isRead ? '#eff6ff' : 'transparent';
                                        }}
                                    >
                                        <div
                                            style={{ flex: 1, cursor: 'pointer' }}
                                            onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                                                {notification.title}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4, marginBottom: '4px' }}>
                                                {notification.message}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                {formatTime(notification.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#9ca3af',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s',
                                                flexShrink: 0,
                                            }}
                                            onClick={() => handleDelete(notification._id)}
                                            aria-label="Delete notification"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fee2e2';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#9ca3af';
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

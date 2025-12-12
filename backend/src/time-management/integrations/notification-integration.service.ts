import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationLog, NotificationLogDocument } from '../models/notification-log.schema';

/**
 * NOTIFICATION MODULE INTEGRATION SERVICE
 * 
 * Purpose: Send alerts for system events including:
 * - Shift Expiry (Story 4)
 * - Missed Punch (Story 8)
 * - Repeated Lateness (Story 11)
 * - Escalation Before Payroll Cut-Off (Story 18)
 * - Approved / Rejected Corrections (Story 13)
 * 
 * TODO: Connect to actual Notification module when implemented
 */

export enum NotificationType {
  // Shift Management
  SHIFT_EXPIRY = 'SHIFT_EXPIRY',
  SHIFT_ASSIGNED = 'SHIFT_ASSIGNED',
  SHIFT_CHANGED = 'SHIFT_CHANGED',
  
  // Attendance
  MISSED_PUNCH = 'MISSED_PUNCH',
  CLOCK_REMINDER = 'CLOCK_REMINDER',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  EARLY_DEPARTURE = 'EARLY_DEPARTURE',
  
  // Lateness & Exceptions
  REPEATED_LATENESS = 'REPEATED_LATENESS',
  LATENESS_WARNING = 'LATENESS_WARNING',
  LATENESS_ESCALATION = 'LATENESS_ESCALATION',
  
  // Correction Requests
  CORRECTION_SUBMITTED = 'CORRECTION_SUBMITTED',
  CORRECTION_APPROVED = 'CORRECTION_APPROVED',
  CORRECTION_REJECTED = 'CORRECTION_REJECTED',
  CORRECTION_PENDING_REVIEW = 'CORRECTION_PENDING_REVIEW',
  
  // Escalations
  REQUEST_ESCALATED = 'REQUEST_ESCALATED',
  PAYROLL_CUTOFF_WARNING = 'PAYROLL_CUTOFF_WARNING',
  PENDING_APPROVAL_REMINDER = 'PENDING_APPROVAL_REMINDER',
  
  // System
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export interface NotificationPayload {
  type: NotificationType;
  recipientId: string;
  message: string;
  title?: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  data?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  channels?: NotificationChannel[];
}

@Injectable()
export class NotificationIntegrationService {
  private readonly logger = new Logger(NotificationIntegrationService.name);

  constructor(
    @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  /**
   * Send a notification to a recipient
   * Stores in local log and would route to actual notification service
   * 
   * @param payload - Notification payload
   * @returns Result of notification attempt
   */
  async notify(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      this.logger.log(`[NOTIFICATION] Sending ${payload.type} to ${payload.recipientId}: ${payload.message}`);

      // Store notification in local log (for when notification module is not available)
      const log = await this.notificationLogModel.create({
        to: new Types.ObjectId(payload.recipientId),
        type: payload.type,
        message: payload.message,
      });

      // TODO: Route to actual Notification module when implemented
      // notificationService.send(payload);

      return {
        success: true,
        notificationId: log._id.toString(),
        channels: payload.channels || [NotificationChannel.IN_APP],
      };
    } catch (error) {
      this.logger.error(`[NOTIFICATION] Failed to send notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send shift expiry notification (Story 4)
   */
  async notifyShiftExpiry(employeeId: string, shiftName: string, expiryDate: Date): Promise<NotificationResult> {
    return this.notify({
      type: NotificationType.SHIFT_EXPIRY,
      recipientId: employeeId,
      title: 'Shift Expiring Soon',
      message: `Your shift "${shiftName}" will expire on ${expiryDate.toLocaleDateString()}. Please contact HR for renewal.`,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      data: { shiftName, expiryDate: expiryDate.toISOString() },
    });
  }

  /**
   * Send missed punch notification (Story 8)
   */
  async notifyMissedPunch(employeeId: string, date: Date, managerId?: string): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Notify employee
    results.push(await this.notify({
      type: NotificationType.MISSED_PUNCH,
      recipientId: employeeId,
      title: 'Missed Punch Detected',
      message: `You have a missed punch for ${date.toLocaleDateString()}. Please submit a correction request.`,
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      data: { date: date.toISOString() },
      actionUrl: '/time-management?tab=corrections',
    }));

    // Notify manager if provided
    if (managerId) {
      results.push(await this.notify({
        type: NotificationType.MISSED_PUNCH,
        recipientId: managerId,
        title: 'Team Member Missed Punch',
        message: `A team member has a missed punch for ${date.toLocaleDateString()}. Please review when correction is submitted.`,
        priority: NotificationPriority.MEDIUM,
        channels: [NotificationChannel.IN_APP],
        data: { employeeId, date: date.toISOString() },
      }));
    }

    return results;
  }

  /**
   * Send repeated lateness notification (Story 11)
   */
  async notifyRepeatedLateness(employeeId: string, lateCount: number, periodDays: number, managerId?: string): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Notify employee
    results.push(await this.notify({
      type: NotificationType.REPEATED_LATENESS,
      recipientId: employeeId,
      title: 'Repeated Lateness Warning',
      message: `You have been late ${lateCount} times in the past ${periodDays} days. This has been flagged for review.`,
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      data: { lateCount, periodDays },
    }));

    // Notify manager
    if (managerId) {
      results.push(await this.notify({
        type: NotificationType.LATENESS_ESCALATION,
        recipientId: managerId,
        title: 'Team Member Repeated Lateness',
        message: `A team member has been late ${lateCount} times in the past ${periodDays} days. Please review.`,
        priority: NotificationPriority.MEDIUM,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        data: { employeeId, lateCount, periodDays },
        actionUrl: '/time-management?tab=reports',
      }));
    }

    return results;
  }

  /**
   * Send correction request status notification (Story 13)
   */
  async notifyCorrectionStatus(
    employeeId: string, 
    requestId: string, 
    status: 'APPROVED' | 'REJECTED', 
    comment?: string
  ): Promise<NotificationResult> {
    const type = status === 'APPROVED' 
      ? NotificationType.CORRECTION_APPROVED 
      : NotificationType.CORRECTION_REJECTED;

    return this.notify({
      type,
      recipientId: employeeId,
      title: `Correction Request ${status}`,
      message: status === 'APPROVED'
        ? `Your correction request has been approved.${comment ? ` Comment: ${comment}` : ''}`
        : `Your correction request has been rejected.${comment ? ` Reason: ${comment}` : ''}`,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      data: { requestId, status, comment },
      actionUrl: '/time-management?tab=corrections',
    });
  }

  /**
   * Send escalation notification (Story 18)
   */
  async notifyEscalation(
    recipientId: string, 
    requestId: string, 
    daysUntilCutoff: number,
    employeeId?: string
  ): Promise<NotificationResult> {
    return this.notify({
      type: NotificationType.REQUEST_ESCALATED,
      recipientId,
      title: 'Urgent: Pending Request Escalation',
      message: `A correction request has been escalated. ${daysUntilCutoff} days until payroll cut-off.`,
      priority: NotificationPriority.URGENT,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
      data: { requestId, daysUntilCutoff, employeeId },
      actionUrl: '/time-management?tab=corrections',
    });
  }

  /**
   * Send payroll cutoff warning notification
   */
  async notifyPayrollCutoffWarning(recipientIds: string[], daysUntilCutoff: number): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const recipientId of recipientIds) {
      results.push(await this.notify({
        type: NotificationType.PAYROLL_CUTOFF_WARNING,
        recipientId,
        title: 'Payroll Cut-off Approaching',
        message: `Payroll cut-off is in ${daysUntilCutoff} days. Please ensure all attendance corrections are submitted.`,
        priority: daysUntilCutoff <= 2 ? NotificationPriority.URGENT : NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        data: { daysUntilCutoff },
      }));
    }

    return results;
  }

  /**
   * Send pending approval reminder to managers
   */
  async notifyPendingApprovals(managerId: string, pendingCount: number): Promise<NotificationResult> {
    return this.notify({
      type: NotificationType.PENDING_APPROVAL_REMINDER,
      recipientId: managerId,
      title: 'Pending Approvals Reminder',
      message: `You have ${pendingCount} correction request(s) pending approval.`,
      priority: pendingCount > 5 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      data: { pendingCount },
      actionUrl: '/time-management?tab=corrections',
    });
  }

  /**
   * Get notification history for a recipient
   */
  async getNotificationHistory(recipientId: string, limit: number = 50): Promise<NotificationLog[]> {
    return this.notificationLogModel
      .find({ to: new Types.ObjectId(recipientId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Mark notifications as read (would update actual notification module)
   */
  async markAsRead(notificationIds: string[]): Promise<void> {
    // TODO: Update actual notification module when implemented
    this.logger.debug(`[NOTIFICATION STUB] Marking ${notificationIds.length} notifications as read`);
  }
}

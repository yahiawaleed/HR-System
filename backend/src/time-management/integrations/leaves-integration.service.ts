import { Injectable, Logger } from '@nestjs/common';

/**
 * LEAVES/VACATION MODULE INTEGRATION SERVICE
 * 
 * Purpose: Attendance must NOT mark an employee absent, late, or penalized 
 * on days where they are on vacation, approved leave, or official rest day.
 * 
 * TODO: Connect to actual Leaves module when implemented
 */

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT',
  UNPAID = 'UNPAID',
  COMPENSATORY = 'COMPENSATORY',
  EMERGENCY = 'EMERGENCY',
  STUDY = 'STUDY',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveInfo {
  leaveId: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  isHalfDay: boolean;
  halfDayPeriod?: 'MORNING' | 'AFTERNOON';
}

export interface DayLeaveStatus {
  isOnLeave: boolean;
  isApprovedLeave: boolean;
  isRestDay: boolean;
  leaveType?: LeaveType;
  isHalfDay: boolean;
  halfDayPeriod?: 'MORNING' | 'AFTERNOON';
  reason?: string;
}

@Injectable()
export class LeavesIntegrationService {
  private readonly logger = new Logger(LeavesIntegrationService.name);

  /**
   * Check if an employee is on approved leave for a specific date
   * Used to suppress lateness penalties and absence flags
   * 
   * @param employeeId - Employee ID to check
   * @param date - Date to check
   * @returns Whether employee is on approved leave
   */
  async isEmployeeOnLeave(employeeId: string, date: Date): Promise<boolean> {
    // TODO: Replace with actual Leaves module query when implemented
    this.logger.debug(`[LEAVES STUB] Checking leave status for employee ${employeeId} on ${date.toDateString()}`);
    
    // For now, return false (not on leave)
    // Real implementation would query: leavesService.getApprovedLeaves(employeeId, date)
    return false;
  }

  /**
   * Get detailed leave status for a specific day
   * 
   * @param employeeId - Employee ID to check
   * @param date - Date to check
   * @returns Detailed leave status including type, half-day info
   */
  async getDayLeaveStatus(employeeId: string, date: Date): Promise<DayLeaveStatus> {
    // TODO: Replace with actual Leaves module query when implemented
    this.logger.debug(`[LEAVES STUB] Getting detailed leave status for employee ${employeeId} on ${date.toDateString()}`);

    // Check if it's a weekend (Saturday/Sunday) - treat as rest day
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return {
        isOnLeave: false,
        isApprovedLeave: false,
        isRestDay: true,
        isHalfDay: false,
        reason: 'Weekend rest day',
      };
    }

    // Default: not on leave
    return {
      isOnLeave: false,
      isApprovedLeave: false,
      isRestDay: false,
      isHalfDay: false,
    };
  }

  /**
   * Get all approved leaves for an employee in a date range
   * Used for payroll sync and reporting
   * 
   * @param employeeId - Employee ID
   * @param startDate - Range start date
   * @param endDate - Range end date
   * @returns Array of leave records
   */
  async getApprovedLeaves(employeeId: string, startDate: Date, endDate: Date): Promise<LeaveInfo[]> {
    // TODO: Replace with actual Leaves module query when implemented
    this.logger.debug(`[LEAVES STUB] Getting approved leaves for employee ${employeeId} from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    // Return empty array - no leaves found
    return [];
  }

  /**
   * Get excused days for an employee (includes leaves, holidays, rest days)
   * Used for lateness threshold calculations
   * 
   * @param employeeId - Employee ID
   * @param startDate - Range start date
   * @param endDate - Range end date
   * @returns Array of excused dates
   */
  async getExcusedDays(employeeId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    // TODO: Replace with actual Leaves module query when implemented
    this.logger.debug(`[LEAVES STUB] Getting excused days for employee ${employeeId} from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const excusedDays: Date[] = [];
    
    // Add weekends as excused days
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        excusedDays.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    
    // TODO: Add approved leaves from Leaves module
    
    return excusedDays;
  }

  /**
   * Check if lateness penalty should be suppressed for a specific date
   * Considers: approved leave, holiday, rest day
   * 
   * @param employeeId - Employee ID
   * @param date - Date to check
   * @returns Whether to suppress penalty
   */
  async shouldSuppressLatenessPenalty(employeeId: string, date: Date): Promise<boolean> {
    const status = await this.getDayLeaveStatus(employeeId, date);
    
    // Suppress penalty if on leave, rest day, or half-day in the morning
    if (status.isOnLeave || status.isRestDay) {
      this.logger.debug(`[LEAVES STUB] Suppressing lateness penalty for ${employeeId} on ${date.toDateString()}: ${status.reason || 'on leave/rest'}`);
      return true;
    }
    
    // Half-day afternoon leave - don't suppress morning lateness
    if (status.isHalfDay && status.halfDayPeriod === 'AFTERNOON') {
      return false;
    }
    
    // Half-day morning leave - suppress morning lateness
    if (status.isHalfDay && status.halfDayPeriod === 'MORNING') {
      return true;
    }
    
    return false;
  }

  /**
   * Get remaining leave balance for an employee
   * 
   * @param employeeId - Employee ID
   * @param leaveType - Type of leave to check
   * @returns Remaining days
   */
  async getLeaveBalance(employeeId: string, leaveType: LeaveType): Promise<number> {
    // TODO: Replace with actual Leaves module query when implemented
    this.logger.debug(`[LEAVES STUB] Getting ${leaveType} balance for employee ${employeeId}`);
    
    // Return default balances
    const defaultBalances: Record<LeaveType, number> = {
      [LeaveType.ANNUAL]: 21,
      [LeaveType.SICK]: 14,
      [LeaveType.MATERNITY]: 90,
      [LeaveType.PATERNITY]: 5,
      [LeaveType.BEREAVEMENT]: 3,
      [LeaveType.UNPAID]: 999,
      [LeaveType.COMPENSATORY]: 0,
      [LeaveType.EMERGENCY]: 2,
      [LeaveType.STUDY]: 10,
      [LeaveType.OTHER]: 0,
    };
    
    return defaultBalances[leaveType] || 0;
  }
}

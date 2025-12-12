import { Injectable, Logger } from '@nestjs/common';

/**
 * PAYROLL MODULE INTEGRATION SERVICE
 * 
 * Purpose: Ensure Payroll receives validated work hours, overtime, short time, 
 * lateness penalties, and exceptions from Time Management.
 * 
 * TODO: Connect to actual Payroll module when implemented
 */

export interface PayrollDailyPayload {
  employeeId: string;
  date: Date;
  totalWorkMinutes: number;
  overtimeMinutes: number;
  penaltyMinutes: number;
  latenessMinutes: number;
  exceptions: PayrollException[];
  isHoliday: boolean;
  isOnLeave: boolean;
}

export interface PayrollException {
  type: 'REPEATED_LATENESS' | 'MISSED_PUNCH' | 'MANUAL_CORRECTION' | 'ESCALATED_REQUEST' | 'EARLY_DEPARTURE' | 'UNAUTHORIZED_ABSENCE';
  description: string;
  minutes?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PayrollSyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  timestamp: Date;
}

@Injectable()
export class PayrollIntegrationService {
  private readonly logger = new Logger(PayrollIntegrationService.name);

  /**
   * Receives aggregated attendance data and sends to Payroll module
   * Called by the daily cron job at midnight
   * 
   * @param data - Array of daily payloads per employee
   * @returns Sync result with success/failure counts
   */
  async receiveAttendanceData(data: PayrollDailyPayload[]): Promise<PayrollSyncResult> {
    // TODO: Replace with actual Payroll module API call when implemented
    this.logger.log(`[PAYROLL STUB] Receiving attendance data for ${data.length} employees`);

    const result: PayrollSyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
      timestamp: new Date(),
    };

    for (const payload of data) {
      try {
        // Validate payload before sending
        if (!payload.employeeId || !payload.date) {
          result.errors.push(`Invalid payload: missing employeeId or date`);
          result.failedCount++;
          continue;
        }

        // Log the data that would be sent to Payroll
        this.logger.debug(`[PAYROLL STUB] Employee ${payload.employeeId}:`, {
          date: payload.date,
          totalWorkMinutes: payload.totalWorkMinutes,
          overtimeMinutes: payload.overtimeMinutes,
          penaltyMinutes: payload.penaltyMinutes,
          latenessMinutes: payload.latenessMinutes,
          exceptionsCount: payload.exceptions.length,
        });

        result.syncedCount++;
      } catch (error) {
        result.errors.push(`Failed to sync employee ${payload.employeeId}: ${error.message}`);
        result.failedCount++;
      }
    }

    result.success = result.failedCount === 0;
    
    this.logger.log(`[PAYROLL STUB] Sync completed: ${result.syncedCount} success, ${result.failedCount} failed`);
    
    return result;
  }

  /**
   * Get payroll cut-off date for escalation warnings
   * 
   * @returns The next payroll cut-off date
   */
  async getPayrollCutoffDate(): Promise<Date> {
    // TODO: Get from actual Payroll module configuration
    // Default: Last day of current month
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    cutoff.setHours(23, 59, 59, 999);
    
    this.logger.debug(`[PAYROLL STUB] Payroll cut-off date: ${cutoff.toISOString()}`);
    
    return cutoff;
  }

  /**
   * Check if payroll is locked for a specific period
   * 
   * @param date - Date to check
   * @returns Whether payroll is locked for that date
   */
  async isPayrollLocked(date: Date): Promise<boolean> {
    // TODO: Query actual Payroll module
    // Default: Payroll is locked for dates before the start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const isLocked = date < startOfMonth;
    
    this.logger.debug(`[PAYROLL STUB] Payroll locked for ${date.toDateString()}: ${isLocked}`);
    
    return isLocked;
  }

  /**
   * Get days until payroll cut-off for escalation warnings
   * 
   * @returns Number of days until cut-off
   */
  async getDaysUntilCutoff(): Promise<number> {
    const cutoff = await this.getPayrollCutoffDate();
    const now = new Date();
    const diffTime = cutoff.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}

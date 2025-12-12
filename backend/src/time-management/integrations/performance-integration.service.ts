import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimeException, TimeExceptionDocument } from '../models/time-exception.schema';
import { TimeExceptionType, TimeExceptionStatus } from '../models/enums';

/**
 * PERFORMANCE & DISCIPLINARY MODULE INTEGRATION SERVICE
 * 
 * Purpose: Repeated lateness must generate a disciplinary case.
 * Creates TimeException records for performance review.
 * 
 * TODO: Connect to actual Performance module when implemented
 */

export interface DisciplinaryCase {
  caseId: string;
  employeeId: string;
  type: 'REPEATED_LATENESS' | 'UNAUTHORIZED_ABSENCE' | 'POLICY_VIOLATION';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';
  severity: 'WARNING' | 'WRITTEN_WARNING' | 'FINAL_WARNING' | 'TERMINATION';
  description: string;
  createdAt: Date;
  relatedRecords?: string[];
}

export interface LatenessStats {
  employeeId: string;
  totalLateCount: number;
  totalLateMinutes: number;
  periodDays: number;
  periodStart: Date;
  periodEnd: Date;
  averageLateMinutes: number;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
}

@Injectable()
export class PerformanceIntegrationService {
  private readonly logger = new Logger(PerformanceIntegrationService.name);

  constructor(
    @InjectModel(TimeException.name) private timeExceptionModel: Model<TimeExceptionDocument>,
  ) {}

  /**
   * Flag an employee for repeated lateness (Story 11)
   * Creates a TimeException record and optionally notifies Performance module
   * 
   * @param employeeId - Employee ID
   * @param lateCount - Number of late arrivals in the period
   * @param periodDays - Period in days (e.g., 7 or 30)
   * @param attendanceRecordIds - Related attendance record IDs
   * @param assignedTo - Person responsible for handling (usually manager)
   */
  async flagRepeatedLateness(
    employeeId: string,
    lateCount: number,
    periodDays: number,
    attendanceRecordIds: string[],
    assignedTo: string,
  ): Promise<TimeException> {
    this.logger.log(`[PERFORMANCE] Flagging repeated lateness for employee ${employeeId}: ${lateCount} times in ${periodDays} days`);

    // Create a TimeException record for the first related attendance record
    const exception = await this.timeExceptionModel.create({
      employeeId: new Types.ObjectId(employeeId),
      type: TimeExceptionType.REPEATED_LATENESS,
      attendanceRecordId: attendanceRecordIds.length > 0 
        ? new Types.ObjectId(attendanceRecordIds[0]) 
        : new Types.ObjectId(), // Placeholder if no records
      assignedTo: new Types.ObjectId(assignedTo),
      status: TimeExceptionStatus.OPEN,
      reason: `Employee has been late ${lateCount} times in the past ${periodDays} days`,
    });

    // TODO: Notify Performance module when implemented
    // performanceService.createDisciplinaryCase({
    //   employeeId,
    //   type: 'REPEATED_LATENESS',
    //   severity: this.determineSeverity(lateCount),
    //   relatedRecords: attendanceRecordIds,
    // });

    return exception;
  }

  /**
   * Flag unauthorized absence
   * 
   * @param employeeId - Employee ID
   * @param date - Date of absence
   * @param attendanceRecordId - Related attendance record ID
   * @param assignedTo - Person responsible for handling
   */
  async flagUnauthorizedAbsence(
    employeeId: string,
    date: Date,
    attendanceRecordId: string,
    assignedTo: string,
  ): Promise<TimeException> {
    this.logger.log(`[PERFORMANCE] Flagging unauthorized absence for employee ${employeeId} on ${date.toDateString()}`);

    const exception = await this.timeExceptionModel.create({
      employeeId: new Types.ObjectId(employeeId),
      type: TimeExceptionType.UNAUTHORIZED_ABSENCE,
      attendanceRecordId: new Types.ObjectId(attendanceRecordId),
      assignedTo: new Types.ObjectId(assignedTo),
      status: TimeExceptionStatus.OPEN,
      reason: `Unauthorized absence on ${date.toDateString()}`,
    });

    return exception;
  }

  /**
   * Get open exceptions for an employee
   * 
   * @param employeeId - Employee ID
   * @returns Array of open exceptions
   */
  async getOpenExceptions(employeeId: string): Promise<TimeException[]> {
    return this.timeExceptionModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        status: { $in: [TimeExceptionStatus.OPEN, TimeExceptionStatus.ESCALATED] },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get exceptions assigned to a manager for review
   * 
   * @param managerId - Manager's employee ID
   * @returns Array of exceptions to review
   */
  async getExceptionsForReview(managerId: string): Promise<TimeException[]> {
    return this.timeExceptionModel
      .find({
        assignedTo: new Types.ObjectId(managerId),
        status: { $in: [TimeExceptionStatus.OPEN, TimeExceptionStatus.ESCALATED] },
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('attendanceRecordId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Resolve an exception
   * 
   * @param exceptionId - Exception ID
   * @param resolution - Resolution notes
   */
  async resolveException(exceptionId: string, resolution: string): Promise<TimeException> {
    const exception = await this.timeExceptionModel.findByIdAndUpdate(
      exceptionId,
      {
        status: TimeExceptionStatus.RESOLVED,
        reason: resolution,
      },
      { new: true },
    );

    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    this.logger.log(`[PERFORMANCE] Resolved exception ${exceptionId}`);

    return exception;
  }

  /**
   * Escalate an exception
   * 
   * @param exceptionId - Exception ID
   * @param escalateTo - New assignee ID (HR or higher management)
   */
  async escalateException(exceptionId: string, escalateTo: string): Promise<TimeException> {
    const exception = await this.timeExceptionModel.findByIdAndUpdate(
      exceptionId,
      {
        status: TimeExceptionStatus.ESCALATED,
        assignedTo: new Types.ObjectId(escalateTo),
      },
      { new: true },
    );

    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    this.logger.log(`[PERFORMANCE] Escalated exception ${exceptionId} to ${escalateTo}`);

    return exception;
  }

  /**
   * Get lateness statistics for an employee
   * 
   * @param employeeId - Employee ID
   * @param periodDays - Number of days to analyze
   */
  async getLatenessStats(employeeId: string, periodDays: number = 30): Promise<LatenessStats> {
    // TODO: Calculate from actual attendance records
    // This would aggregate lateness data for performance review
    
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    return {
      employeeId,
      totalLateCount: 0,
      totalLateMinutes: 0,
      periodDays,
      periodStart,
      periodEnd,
      averageLateMinutes: 0,
      trend: 'STABLE',
    };
  }

  /**
   * Determine severity based on late count
   * Used for disciplinary case creation
   */
  private determineSeverity(lateCount: number): 'WARNING' | 'WRITTEN_WARNING' | 'FINAL_WARNING' | 'TERMINATION' {
    if (lateCount >= 10) return 'FINAL_WARNING';
    if (lateCount >= 6) return 'WRITTEN_WARNING';
    return 'WARNING';
  }

  /**
   * Create a disciplinary case in the Performance module
   * 
   * @param data - Case data
   * @returns Case ID
   */
  async createDisciplinaryCase(data: {
    employeeId: string;
    type: 'REPEATED_LATENESS' | 'UNAUTHORIZED_ABSENCE' | 'POLICY_VIOLATION';
    severity: 'WARNING' | 'WRITTEN_WARNING' | 'FINAL_WARNING' | 'TERMINATION';
    description: string;
    relatedRecords?: string[];
  }): Promise<string> {
    // TODO: Connect to actual Performance module when implemented
    this.logger.log(`[PERFORMANCE STUB] Creating disciplinary case:`, data);
    
    // Return a placeholder ID
    const caseId = `DC-${Date.now()}`;
    
    this.logger.debug(`[PERFORMANCE STUB] Created disciplinary case ${caseId}`);
    
    return caseId;
  }

  /**
   * Get disciplinary history for an employee
   * 
   * @param employeeId - Employee ID
   * @returns Array of disciplinary cases
   */
  async getDisciplinaryHistory(employeeId: string): Promise<DisciplinaryCase[]> {
    // TODO: Connect to actual Performance module when implemented
    this.logger.debug(`[PERFORMANCE STUB] Getting disciplinary history for ${employeeId}`);
    
    return [];
  }
}

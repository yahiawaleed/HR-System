import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { ShiftType, ShiftTypeDocument } from './models/shift-type.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from './models/shift-assignment.schema';
import { ScheduleRule, ScheduleRuleDocument } from './models/schedule-rule.schema';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import { NotificationLog } from './models/notification-log.schema';
import { AttendanceRecord, AttendanceRecordDocument, Punch } from './models/attendance-record.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './models/attendance-correction-request.schema';
import { Settings, SettingsDocument } from './models/settings.schema';
import { OvertimeRule, OvertimeRuleDocument } from './models/overtime-rule.schema';
import { LatenessRule, LatenessRuleDocument } from './models/lateness-rule.schema';
import { TimeException, TimeExceptionDocument } from './models/time-exception.schema';
import {
  CreateShiftTypeDto,
  UpdateShiftTypeDto,
  AssignShiftDto,
  UpdateShiftDto,
  UpdateShiftStatusDto,
  CreateScheduleRuleDto,
  UpdateScheduleRuleDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  ClockInDto,
  ClockOutDto,
  ManualCorrectionDto,
  UpdatePunchPolicyDto,
  CreateCorrectionRequestDto,
  ReviewCorrectionDto,
  CreateOvertimeRuleDto,
  UpdateOvertimeRuleDto,
  CreateLatenessRuleDto,
  UpdateLatenessRuleDto,
  GetReportDto,
} from './dto';
import { ShiftAssignmentStatus, PunchType, CorrectionRequestStatus } from './models/enums';
import { ReviewAction } from './dto/review-correction.dto';

@Injectable()
export class TimeManagementService {
  constructor(
    @InjectModel(ShiftType.name) private shiftTypeModel: Model<ShiftTypeDocument>,
    @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignmentDocument>,
    @InjectModel(ScheduleRule.name) private scheduleRuleModel: Model<ScheduleRuleDocument>,
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLog>,
    @InjectModel(AttendanceRecord.name) private attendanceRecordModel: Model<AttendanceRecordDocument>,
    @InjectModel(AttendanceCorrectionRequest.name) private correctionRequestModel: Model<AttendanceCorrectionRequestDocument>,
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    @InjectModel(OvertimeRule.name) private overtimeRuleModel: Model<OvertimeRuleDocument>,
    @InjectModel(LatenessRule.name) private latenessRuleModel: Model<LatenessRuleDocument>,
    @InjectModel(TimeException.name) private timeExceptionModel: Model<TimeExceptionDocument>,
  ) { }

  // ==================== SHIFT TYPES ====================

  async createShiftType(dto: CreateShiftTypeDto) {
    const shiftType = new this.shiftTypeModel(dto);
    return shiftType.save();
  }

  async getShiftTypes() {
    return this.shiftTypeModel.find().exec();
  }

  async getShiftTypeById(id: string) {
    const shiftType = await this.shiftTypeModel.findById(id).exec();
    if (!shiftType) {
      throw new NotFoundException(`Shift type with ID ${id} not found`);
    }
    return shiftType;
  }

  async updateShiftType(id: string, dto: UpdateShiftTypeDto) {
    const shiftType = await this.shiftTypeModel.findByIdAndUpdate(
      id,
      dto,
      { new: true }
    ).exec();

    if (!shiftType) {
      throw new NotFoundException(`Shift type with ID ${id} not found`);
    }
    return shiftType;
  }

  async deleteShiftType(id: string) {
    // Check if shift type is in use
    const inUse = await this.shiftAssignmentModel.exists({ shiftId: id });
    if (inUse) {
      throw new BadRequestException('Cannot delete shift type that is currently assigned to shifts');
    }

    const result = await this.shiftTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Shift type with ID ${id} not found`);
    }
    return { message: 'Shift type deleted successfully' };
  }

  // ==================== SHIFT ASSIGNMENTS ====================

  async assignShift(dto: AssignShiftDto) {
    // Validate that at least one of employeeId, departmentId, or positionId is provided
    if (!dto.employeeId && !dto.departmentId && !dto.positionId) {
      throw new BadRequestException('At least one of employeeId, departmentId, or positionId must be provided');
    }

    const assignment = new this.shiftAssignmentModel({
      employeeId: dto.employeeId,
      departmentId: dto.departmentId,
      positionId: dto.positionId,
      shiftId: dto.shiftId,
      scheduleRuleId: dto.scheduleRuleId,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status || ShiftAssignmentStatus.PENDING,
    });

    return assignment.save();
  }

  async getShifts(query?: any) {
    return this.shiftAssignmentModel
      .find(query || {})
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('departmentId', 'name')
      .populate('positionId', 'title')
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();
  }

  async getShiftById(id: string) {
    const shift = await this.shiftAssignmentModel
      .findById(id)
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('departmentId', 'name')
      .populate('positionId', 'title')
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();

    if (!shift) {
      throw new NotFoundException(`Shift assignment with ID ${id} not found`);
    }
    return shift;
  }

  async getShiftsByEmployee(employeeId: string) {
    return this.shiftAssignmentModel
      .find({ employeeId })
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();
  }

  async updateShift(id: string, dto: UpdateShiftDto) {
    const updateData: any = {};

    if (dto.employeeId) updateData.employeeId = dto.employeeId;
    if (dto.departmentId) updateData.departmentId = dto.departmentId;
    if (dto.positionId) updateData.positionId = dto.positionId;
    if (dto.shiftId) updateData.shiftId = dto.shiftId;
    if (dto.scheduleRuleId) updateData.scheduleRuleId = dto.scheduleRuleId;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.status) updateData.status = dto.status;

    const shift = await this.shiftAssignmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('departmentId', 'name')
      .populate('positionId', 'title')
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();

    if (!shift) {
      throw new NotFoundException(`Shift assignment with ID ${id} not found`);
    }
    return shift;
  }

  async updateShiftStatus(id: string, dto: UpdateShiftStatusDto) {
    const shift = await this.shiftAssignmentModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true }
    )
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('departmentId', 'name')
      .populate('positionId', 'title')
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();

    if (!shift) {
      throw new NotFoundException(`Shift assignment with ID ${id} not found`);
    }
    return shift;
  }

  async deleteShift(id: string) {
    const result = await this.shiftAssignmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Shift assignment with ID ${id} not found`);
    }
    return { message: 'Shift assignment deleted successfully' };
  }

  // ==================== SCHEDULE RULES ====================

  async createScheduleRule(dto: CreateScheduleRuleDto) {
    const rule = new this.scheduleRuleModel(dto);
    return rule.save();
  }

  async getScheduleRules() {
    return this.scheduleRuleModel.find().exec();
  }

  async getScheduleRuleById(id: string) {
    const rule = await this.scheduleRuleModel.findById(id).exec();
    if (!rule) {
      throw new NotFoundException(`Schedule rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateScheduleRule(id: string, dto: UpdateScheduleRuleDto) {
    const rule = await this.scheduleRuleModel.findByIdAndUpdate(
      id,
      dto,
      { new: true }
    ).exec();

    if (!rule) {
      throw new NotFoundException(`Schedule rule with ID ${id} not found`);
    }
    return rule;
  }

  async deleteScheduleRule(id: string) {
    // Check if schedule rule is in use
    const inUse = await this.shiftAssignmentModel.exists({ scheduleRuleId: id });
    if (inUse) {
      throw new BadRequestException('Cannot delete schedule rule that is currently in use');
    }

    const result = await this.scheduleRuleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Schedule rule with ID ${id} not found`);
    }
    return { message: 'Schedule rule deleted successfully' };
  }

  // ==================== HOLIDAYS ====================

  async createHoliday(dto: CreateHolidayDto) {
    const holiday = new this.holidayModel({
      type: dto.type,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      name: dto.name,
      active: dto.active !== undefined ? dto.active : true,
    });
    return holiday.save();
  }

  async getHolidays() {
    return this.holidayModel.find().exec();
  }

  async getHolidayById(id: string) {
    const holiday = await this.holidayModel.findById(id).exec();
    if (!holiday) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }
    return holiday;
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const updateData: any = {};

    if (dto.type) updateData.type = dto.type;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.name) updateData.name = dto.name;
    if (dto.active !== undefined) updateData.active = dto.active;

    const holiday = await this.holidayModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!holiday) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }
    return holiday;
  }

  async deleteHoliday(id: string) {
    const result = await this.holidayModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }
    return { message: 'Holiday deleted successfully' };
  }

  // ==================== ATTENDANCE - CLOCK IN/OUT (Story 5) ====================

  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  async clockIn(dto: ClockInDto) {
    const today = this.getTodayDate();
    const punchTime = dto.time ? new Date(dto.time) : new Date();

    // Find or create today's attendance record
    let record = await this.attendanceRecordModel.findOne({
      employeeId: new Types.ObjectId(dto.employeeId),
      date: today,
    });

    if (!record) {
      record = new this.attendanceRecordModel({
        employeeId: new Types.ObjectId(dto.employeeId),
        date: today,
        punches: [],
      });
    }

    // Check punch policy
    const policyDoc = await this.settingsModel.findOne({ key: 'PUNCH_POLICY' });
    const policy = policyDoc?.value || 'MULTIPLE';

    if (policy === 'FIRST_LAST' && record.punches.some(p => p.type === PunchType.IN)) {
      // Already has a clock-in, don't add another
      return { message: 'Already clocked in for today (FIRST_LAST policy)', record };
    }

    const punch: Punch = {
      type: PunchType.IN,
      time: punchTime,
      location: dto.location,
    };

    record.punches.push(punch);
    await record.save();

    return { message: 'Clock-in successful', record };
  }

  async clockOut(dto: ClockOutDto) {
    const today = this.getTodayDate();
    const punchTime = dto.time ? new Date(dto.time) : new Date();

    const record = await this.attendanceRecordModel.findOne({
      employeeId: new Types.ObjectId(dto.employeeId),
      date: today,
    });

    if (!record) {
      throw new BadRequestException('No clock-in record found for today. Please clock in first.');
    }

    const lastPunch = record.punches[record.punches.length - 1];
    if (lastPunch?.type === PunchType.OUT) {
      // Check punch policy
      const policyDoc = await this.settingsModel.findOne({ key: 'PUNCH_POLICY' });
      const policy = policyDoc?.value || 'MULTIPLE';

      if (policy === 'FIRST_LAST') {
        // Update the last OUT punch
        record.punches[record.punches.length - 1].time = punchTime;
        if (dto.location) record.punches[record.punches.length - 1].location = dto.location;
        await record.save();
        return { message: 'Clock-out updated (FIRST_LAST policy)', record };
      }
    }

    const punch: Punch = {
      type: PunchType.OUT,
      time: punchTime,
      location: dto.location,
    };

    record.punches.push(punch);

    // Calculate total work minutes
    record.totalWorkMinutes = this.calculateWorkMinutes(record.punches);
    record.hasMissedPunch = false;

    await record.save();

    return { message: 'Clock-out successful', record };
  }

  private calculateWorkMinutes(punches: Punch[]): number {
    let totalMinutes = 0;
    const sortedPunches = [...punches].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    for (let i = 0; i < sortedPunches.length - 1; i += 2) {
      if (sortedPunches[i].type === PunchType.IN && sortedPunches[i + 1]?.type === PunchType.OUT) {
        const inTime = new Date(sortedPunches[i].time).getTime();
        const outTime = new Date(sortedPunches[i + 1].time).getTime();
        totalMinutes += (outTime - inTime) / (1000 * 60);
      }
    }

    return Math.round(totalMinutes);
  }

  async getAttendanceRecords(query?: any) {
    return this.attendanceRecordModel
      .find(query || {})
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .sort({ date: -1 })
      .exec();
  }

  async getAttendanceById(id: string) {
    const record = await this.attendanceRecordModel
      .findById(id)
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .exec();

    if (!record) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return record;
  }

  async getAttendanceByEmployee(employeeId: string) {
    return this.attendanceRecordModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ date: -1 })
      .exec();
  }

  async getMyAttendanceToday(employeeId: string) {
    const today = this.getTodayDate();
    return this.attendanceRecordModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      date: today,
    });
  }

  // ==================== MANUAL CORRECTION (Story 6) ====================

  async correctAttendance(id: string, dto: ManualCorrectionDto) {
    const record = await this.attendanceRecordModel.findById(id);

    if (!record) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    // Replace punches with corrected ones
    record.punches = dto.punches.map(p => ({
      type: p.type === 'IN' ? PunchType.IN : PunchType.OUT,
      time: new Date(p.time),
    }));

    record.correctedBy = new Types.ObjectId(dto.correctedBy);
    record.correctionReason = dto.reason;
    record.totalWorkMinutes = this.calculateWorkMinutes(record.punches);
    record.hasMissedPunch = false;
    record.finalisedForPayroll = true;

    await record.save();

    return { message: 'Attendance corrected successfully', record };
  }

  // ==================== PUNCH POLICY (Story 7) ====================

  async getPunchPolicy() {
    const policy = await this.settingsModel.findOne({ key: 'PUNCH_POLICY' });
    if (!policy) {
      // Return default
      return { key: 'PUNCH_POLICY', value: 'MULTIPLE', description: 'Default punch policy' };
    }
    return policy;
  }

  async updatePunchPolicy(dto: UpdatePunchPolicyDto) {
    const policy = await this.settingsModel.findOneAndUpdate(
      { key: 'PUNCH_POLICY' },
      {
        value: dto.policy,
        description: dto.policy === 'MULTIPLE'
          ? 'Multiple punches allowed per day'
          : 'Only first clock-in and last clock-out count'
      },
      { upsert: true, new: true }
    );
    return policy;
  }

  // ==================== CORRECTION REQUESTS (Story 12 & 13) ====================

  async createCorrectionRequest(dto: CreateCorrectionRequestDto) {
    const request = new this.correctionRequestModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      attendanceRecordId: dto.attendanceRecordId ? new Types.ObjectId(dto.attendanceRecordId) : undefined,
      date: new Date(dto.date),
      requestedPunches: dto.requestedPunches.map(p => ({
        type: p.type === 'IN' ? PunchType.IN : PunchType.OUT,
        time: new Date(p.time),
      })),
      reason: dto.reason,
      status: CorrectionRequestStatus.SUBMITTED,
    });

    await request.save();

    // Mark attendance record as not finalized if it exists
    if (dto.attendanceRecordId) {
      await this.attendanceRecordModel.findByIdAndUpdate(
        dto.attendanceRecordId,
        { finalisedForPayroll: false }
      );
    }

    return request;
  }

  async getCorrectionRequests() {
    return this.correctionRequestModel
      .find()
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .populate('reviewedBy', 'firstName lastName fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getCorrectionRequestById(id: string) {
    const request = await this.correctionRequestModel
      .findById(id)
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .populate('attendanceRecordId')
      .populate('reviewedBy', 'firstName lastName fullName')
      .exec();

    if (!request) {
      throw new NotFoundException(`Correction request with ID ${id} not found`);
    }
    return request;
  }

  async getMyRequests(employeeId: string) {
    return this.correctionRequestModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('reviewedBy', 'firstName lastName fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingRequests() {
    return this.correctionRequestModel
      .find({ status: CorrectionRequestStatus.SUBMITTED })
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .sort({ createdAt: -1 })
      .exec();
  }

  async reviewCorrectionRequest(id: string, dto: ReviewCorrectionDto) {
    const request = await this.correctionRequestModel.findById(id);

    if (!request) {
      throw new NotFoundException(`Correction request with ID ${id} not found`);
    }

    if (request.status !== CorrectionRequestStatus.SUBMITTED) {
      throw new BadRequestException('This request has already been reviewed');
    }

    request.status = dto.action === ReviewAction.APPROVE
      ? CorrectionRequestStatus.APPROVED
      : CorrectionRequestStatus.REJECTED;
    request.reviewedBy = new Types.ObjectId(dto.reviewedBy);
    request.reviewComment = dto.comment;
    request.reviewedAt = new Date();

    await request.save();

    // If approved, update the attendance record
    if (dto.action === ReviewAction.APPROVE) {
      const dateStart = new Date(request.date);
      dateStart.setHours(0, 0, 0, 0);

      let attendanceRecord = await this.attendanceRecordModel.findOne({
        employeeId: request.employeeId,
        date: dateStart,
      });

      if (!attendanceRecord) {
        attendanceRecord = new this.attendanceRecordModel({
          employeeId: request.employeeId,
          date: dateStart,
          punches: [],
        });
      }

      attendanceRecord.punches = request.requestedPunches;
      attendanceRecord.totalWorkMinutes = this.calculateWorkMinutes(attendanceRecord.punches);
      attendanceRecord.hasMissedPunch = false;
      attendanceRecord.finalisedForPayroll = true;
      attendanceRecord.correctedBy = new Types.ObjectId(dto.reviewedBy);
      attendanceRecord.correctionReason = `Approved correction request: ${request.reason}`;

      await attendanceRecord.save();

      // Create notification for employee
      await this.notificationLogModel.create({
        type: 'CORRECTION_APPROVED',
        employeeId: request.employeeId,
        message: 'Your attendance correction request has been approved',
        createdAt: new Date(),
      });
    } else {
      // Create notification for rejection
      await this.notificationLogModel.create({
        type: 'CORRECTION_REJECTED',
        employeeId: request.employeeId,
        message: `Your attendance correction request has been rejected. Reason: ${dto.comment || 'No reason provided'}`,
        createdAt: new Date(),
      });
    }

    return request;
  }

  // ==================== BACKGROUND JOB - MISSED PUNCH ALERTS (Story 8) ====================

  @Cron('0 18 * * *') // Daily at 6 PM
  async flagMissedPunches() {
    const today = this.getTodayDate();

    const records = await this.attendanceRecordModel.find({
      date: today,
    });

    let flaggedCount = 0;

    for (const record of records) {
      if (record.punches.length === 0) continue;

      const lastPunch = record.punches[record.punches.length - 1];
      if (lastPunch?.type === PunchType.IN) {
        record.hasMissedPunch = true;
        await record.save();

        await this.notificationLogModel.create({
          type: 'MISSED_PUNCH',
          employeeId: record.employeeId,
          message: 'You forgot to clock out today',
          createdAt: new Date(),
        });

        flaggedCount++;
      }
    }

    console.log(`Missed punch check completed: ${flaggedCount} employees flagged`);
  }

  // ==================== BACKGROUND JOB - SHIFT EXPIRY NOTIFICATION ====================

  @Cron('0 8 * * *') // Daily at 8 AM
  async checkExpiringShifts() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringShifts = await this.shiftAssignmentModel
      .find({
        endDate: { $lte: sevenDaysFromNow, $gte: new Date() },
        status: ShiftAssignmentStatus.APPROVED,
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('shiftId')
      .exec();

    for (const shift of expiringShifts) {
      const employee = shift.employeeId as any;
      const employeeName = employee ? `${employee.firstName} ${employee.lastName} (${employee.employeeNumber})` : 'Unknown Employee';

      await this.notificationLogModel.create({
        type: 'SHIFT_EXPIRY',
        message: `Shift for employee ${employeeName} expires on ${shift.endDate?.toDateString()}`,
        createdAt: new Date(),
      });
    }

    console.log(`Checked for expiring shifts: ${expiringShifts.length} shifts expiring in the next 7 days`);
  }

  // ==================== OVERTIME RULES ====================

  async createOvertimeRule(dto: CreateOvertimeRuleDto) {
    const overtimeRule = new this.overtimeRuleModel(dto);
    return overtimeRule.save();
  }

  async getOvertimeRules() {
    return this.overtimeRuleModel.find().exec();
  }

  async getOvertimeRuleById(id: string) {
    const rule = await this.overtimeRuleModel.findById(id).exec();
    if (!rule) {
      throw new NotFoundException(`Overtime rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateOvertimeRule(id: string, dto: UpdateOvertimeRuleDto) {
    const rule = await this.overtimeRuleModel.findByIdAndUpdate(
      id,
      dto,
      { new: true }
    ).exec();

    if (!rule) {
      throw new NotFoundException(`Overtime rule with ID ${id} not found`);
    }
    return rule;
  }

  async deleteOvertimeRule(id: string) {
    const result = await this.overtimeRuleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Overtime rule with ID ${id} not found`);
    }
    return { message: 'Overtime rule deleted successfully' };
  }

  // ==================== LATENESS RULES ====================

  async createLatenessRule(dto: CreateLatenessRuleDto) {
    const latenessRule = new this.latenessRuleModel(dto);
    return latenessRule.save();
  }

  async getLatenessRules() {
    return this.latenessRuleModel.find().exec();
  }

  async getLatenessRuleById(id: string) {
    const rule = await this.latenessRuleModel.findById(id).exec();
    if (!rule) {
      throw new NotFoundException(`Lateness rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateLatenessRule(id: string, dto: UpdateLatenessRuleDto) {
    const rule = await this.latenessRuleModel.findByIdAndUpdate(
      id,
      dto,
      { new: true }
    ).exec();

    if (!rule) {
      throw new NotFoundException(`Lateness rule with ID ${id} not found`);
    }
    return rule;
  }

  async deleteLatenessRule(id: string) {
    const result = await this.latenessRuleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Lateness rule with ID ${id} not found`);
    }
    return { message: 'Lateness rule deleted successfully' };
  }

  // ==================== REPORTS (Story 17) ====================

  async getOvertimeReport(dto: GetReportDto) {
    const query: any = {
      date: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.employeeId) {
      query.employeeId = new Types.ObjectId(dto.employeeId);
    }

    if (dto.departmentId) {
      // Filter through attendance records that match employees in the department
      // This is a placeholder - full implementation would require joining with employee data
      query.departmentId = new Types.ObjectId(dto.departmentId);
    }

    const records = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'firstName lastName fullName employeeNumber departmentId')
      .sort({ date: -1 })
      .exec();

    // Calculate overtime (work minutes exceeding standard 8 hours = 480 minutes)
    const overtimeData = records.map(record => ({
      employee: record.employeeId,
      date: record.date,
      totalWorkMinutes: record.totalWorkMinutes,
      overtimeMinutes: Math.max(0, (record.totalWorkMinutes || 0) - 480),
    })).filter(r => r.overtimeMinutes > 0);

    return {
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalRecords: overtimeData.length,
      data: overtimeData,
    };
  }

  async getLatenessReport(dto: GetReportDto) {
    const query: any = {
      date: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
      isLate: true,
    };

    if (dto.employeeId) {
      query.employeeId = new Types.ObjectId(dto.employeeId);
    }

    const records = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .sort({ date: -1 })
      .exec();

    return {
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalRecords: records.length,
      data: records.map(record => ({
        employee: record.employeeId,
        date: record.date,
        lateMinutes: record.lateMinutes || 0,
      })),
    };
  }

  async getExceptionsReport(dto: GetReportDto) {
    const query: any = {
      createdAt: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.employeeId) {
      query.employeeId = new Types.ObjectId(dto.employeeId);
    }

    const exceptions = await this.timeExceptionModel
      .find(query)
      .populate('employeeId', 'firstName lastName fullName employeeNumber')
      .sort({ createdAt: -1 })
      .exec();

    return {
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalRecords: exceptions.length,
      data: exceptions,
    };
  }

  async getAttendanceReport(dto: GetReportDto) {
    const query: any = {
      date: {
        $gte: new Date(dto.startDate),
        $lte: new Date(dto.endDate),
      },
    };

    if (dto.employeeId) {
      query.employeeId = new Types.ObjectId(dto.employeeId);
    }

    const records = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'firstName lastName fullName employeeNumber departmentId')
      .sort({ date: -1 })
      .exec();

    // Summary statistics
    const totalWorkMinutes = records.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0);
    const lateCount = records.filter(r => r.isLate).length;
    const missedPunchCount = records.filter(r => r.hasMissedPunch).length;

    return {
      startDate: dto.startDate,
      endDate: dto.endDate,
      summary: {
        totalRecords: records.length,
        totalWorkMinutes,
        totalWorkHours: Math.round(totalWorkMinutes / 60 * 100) / 100,
        lateCount,
        missedPunchCount,
      },
      data: records,
    };
  }

  // ==================== CROSS-MODULE PLACEHOLDER (Story 15) ====================

  async isEmployeeOnLeave(employeeId: string, date: Date): Promise<boolean> {
    // Placeholder for cross-module integration with leave management
    // This would query the leave management module to check if the employee has approved leave
    // For now, returns false (not on leave)
    console.log(`Checking if employee ${employeeId} is on leave on ${date.toDateString()}`);
    return false;
  }

  // ==================== BACKGROUND JOBS (Stories 11, 16, 18) ====================

  @Cron('0 9 * * 1') // Weekly on Monday at 9 AM
  async flagRepeatedLateness() {
    // Find employees with 3+ late arrivals in the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lateRecords = await this.attendanceRecordModel.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
          isLate: true,
        },
      },
      {
        $group: {
          _id: '$employeeId',
          lateCount: { $sum: 1 },
          dates: { $push: '$date' },
        },
      },
      {
        $match: {
          lateCount: { $gte: 3 },
        },
      },
    ]);

    for (const record of lateRecords) {
      await this.notificationLogModel.create({
        type: 'REPEATED_LATENESS',
        employeeId: record._id,
        message: `Employee has been late ${record.lateCount} times in the past week`,
        createdAt: new Date(),
      });
    }

    console.log(`Flagged repeated lateness: ${lateRecords.length} employees with 3+ late arrivals`);
  }

  @Cron('0 0 * * *') // Daily at midnight
  async syncToPayroll() {
    // Sync finalized attendance records to payroll
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const recordsToSync = await this.attendanceRecordModel.find({
      date: yesterday,
      finalisedForPayroll: true,
    });

    // Placeholder: In real implementation, this would call payroll module
    console.log(`Syncing ${recordsToSync.length} attendance records to payroll for ${yesterday.toDateString()}`);

    // Mark as synced (placeholder)
    for (const record of recordsToSync) {
      // Would update record with payroll sync timestamp
      console.log(`Synced record for employee ${record.employeeId}`);
    }
  }

  @Cron('0 9 * * *') // Daily at 9 AM
  async escalatePendingRequests() {
    // Find correction requests pending for more than 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const pendingRequests = await this.correctionRequestModel.find({
      status: CorrectionRequestStatus.SUBMITTED,
      createdAt: { $lte: twoDaysAgo },
    });

    for (const request of pendingRequests) {
      request.status = CorrectionRequestStatus.ESCALATED;
      await request.save();

      await this.notificationLogModel.create({
        type: 'REQUEST_ESCALATED',
        employeeId: request.employeeId,
        message: 'Your correction request has been escalated due to pending approval for more than 48 hours',
        createdAt: new Date(),
      });
    }

    console.log(`Escalated ${pendingRequests.length} pending correction requests`);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveRequestDocument } from './models/leave-request.schema';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementDocument } from './models/leave-entitlement.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { LeaveStatus } from './enums/leave-status.enum';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { CreateLeaveEntitlementDto } from './dto/create-leave-entitlement.dto';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveEntitlement.name) private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
  ) { }

  // Leave Request Methods
  async createLeaveRequest(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const leaveType = await this.leaveTypeModel.findById(createLeaveRequestDto.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    if (leaveType.requiresAttachment && !createLeaveRequestDto.attachmentId) {
      throw new BadRequestException('Attachment is required for this leave type');
    }

    const balance = await this.getEmployeeLeaveBalance(
      createLeaveRequestDto.employeeId,
      createLeaveRequestDto.leaveTypeId,
    );

    if (balance.available < createLeaveRequestDto.durationDays) {
      throw new BadRequestException('Insufficient leave balance');
    }

    const leaveRequest = new this.leaveRequestModel({
      ...createLeaveRequestDto,
      dates: {
        from: createLeaveRequestDto.fromDate,
        to: createLeaveRequestDto.toDate,
      },
      status: LeaveStatus.PENDING,
      employeeId: new Types.ObjectId(createLeaveRequestDto.employeeId),
      leaveTypeId: new Types.ObjectId(createLeaveRequestDto.leaveTypeId),
    });

    return await leaveRequest.save();
  }

  async findAllLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
    const query: any = {};
    if (employeeId) {
      query.employeeId = new Types.ObjectId(employeeId);
    }
    return await this.leaveRequestModel.find(query).populate('leaveTypeId').populate('employeeId').exec();
  }

  async findLeaveRequestById(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestModel
      .findById(id)
      .populate('leaveTypeId')
      .populate('employeeId')
      .exec();

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    return leaveRequest;
  }

  async updateLeaveRequest(id: string, updateLeaveRequestDto: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    const leaveRequest = await this.findLeaveRequestById(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot update leave request that is not pending');
    }

    const updated = await this.leaveRequestModel
      .findByIdAndUpdate(id, updateLeaveRequestDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Leave request not found');
    }
    return updated;
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    const leaveRequest = await this.findLeaveRequestById(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot delete leave request that is not pending');
    }

    const result = await this.leaveRequestModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Leave request not found');
    }
  }

  async approveLeaveRequest(id: string, approveDto: ApproveLeaveRequestDto): Promise<LeaveRequest> {
    const leaveRequest = await this.findLeaveRequestById(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending approval');
    }

    // 1. Deduct Balance FIRST (if approving)
    if (approveDto.status === LeaveStatus.APPROVED) {
      // Fetch raw document to get IDs even if referenced documents don't exist (Mock Data support)
      const rawRequest = await this.leaveRequestModel.findById(id).exec();

      if (!rawRequest) {
        throw new NotFoundException('Leave request not found');
      }

      const empId = rawRequest.employeeId;
      const typeId = rawRequest.leaveTypeId;

      if (!empId || !typeId) {
        throw new BadRequestException('Invalid reference data: Employee or Leave Type missing in request.');
      }

      await this.deductLeaveBalance(
        empId.toString(),
        typeId.toString(),
        leaveRequest.durationDays,
      );
    }

    // 2. Prepare Update
    const updateData: any = {
      status: approveDto.status,
      managerComments: approveDto.comments,
    };

    if (approveDto.status === LeaveStatus.APPROVED) {
      updateData.approvedByManagerId = new Types.ObjectId(approveDto.approverId);
    }

    // 3. Update Status
    const updated = await this.leaveRequestModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();

    if (!updated) {
      throw new NotFoundException('Leave request not found after update');
    }

    return updated;
  }

  async hrReviewLeaveRequest(id: string, approveDto: ApproveLeaveRequestDto): Promise<LeaveRequest> {
    const leaveRequest = await this.findLeaveRequestById(id);

    if (leaveRequest.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException('Leave request must be approved by manager first');
    }

    const updateData: any = {
      status: approveDto.status,
      hrComments: approveDto.comments,
    };

    if (approveDto.status === LeaveStatus.APPROVED) {
      updateData.approvedByHRId = new Types.ObjectId(approveDto.approverId);
    }

    const updated = await this.leaveRequestModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();

    if (!updated) {
      throw new NotFoundException('Leave request not found after HR review');
    }

    return updated;
  }

  // Leave Type Methods
  async createLeaveType(createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = new this.leaveTypeModel(createLeaveTypeDto);
    return await leaveType.save();
  }

  async findAllLeaveTypes(): Promise<LeaveType[]> {
    return await this.leaveTypeModel.find().populate('categoryId').exec();
  }

  async findLeaveTypeById(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel.findById(id).populate('categoryId').exec();
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }
    return leaveType;
  }

  // Leave Policy Methods
  async createLeavePolicy(createLeavePolicyDto: CreateLeavePolicyDto): Promise<LeavePolicy> {
    const leaveType = await this.leaveTypeModel.findById(createLeavePolicyDto.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const policy = new this.leavePolicyModel(createLeavePolicyDto);
    return await policy.save();
  }

  async findAllLeavePolicies(): Promise<LeavePolicy[]> {
    return await this.leavePolicyModel.find().populate('leaveTypeId').exec();
  }

  // Leave Balance Methods
  async getEmployeeLeaveBalance(employeeId: string, leaveTypeId: string): Promise<any> {
    // Get entitlements
    const entitlements = await this.leaveEntitlementModel.find({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    }).exec();

    // Get approved leave requests
    const approvedLeaves = await this.leaveRequestModel.find({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      status: LeaveStatus.APPROVED,
    }).exec();

    // Get pending leave requests
    const pendingLeaves = await this.leaveRequestModel.find({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      status: LeaveStatus.PENDING,
    }).exec();

    // Initialize values
    let yearlyEntitlement = 0;
    let carryForward = 0;
    let accruedRounded = 0;
    let taken = 0;
    let pendingTotal = 0;
    let lastAccrualDate: Date | undefined;
    let nextResetDate: Date | undefined;

    if (entitlements.length > 0) {
      const entitlement = entitlements[0];
      yearlyEntitlement = entitlement.yearlyEntitlement;
      carryForward = entitlement.carryForward;
      accruedRounded = entitlement.accruedRounded;
      taken = entitlement.taken;
      pendingTotal = entitlement.pending;
      lastAccrualDate = entitlement.lastAccrualDate;
      nextResetDate = entitlement.nextResetDate;
    }

    const used = approvedLeaves.reduce((sum, leave) => sum + leave.durationDays, 0);
    const pendingRequests = pendingLeaves.reduce((sum, leave) => sum + leave.durationDays, 0);

    // Total = yearly entitlement + carry forward + accrued rounded
    const total = yearlyEntitlement + carryForward + accruedRounded;
    const available = total - taken - pendingRequests;

    return {
      employeeId,
      leaveTypeId,
      yearlyEntitlement,
      carryForward,
      accruedRounded,
      total,
      used: taken,
      pending: pendingRequests,
      available,
      lastAccrualDate,
      nextResetDate
    };
  }

  async createEntitlement(dto: CreateLeaveEntitlementDto): Promise<LeaveEntitlement> {
    const existing = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(dto.employeeId),
      leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
    });

    if (existing) {
      existing.yearlyEntitlement = dto.totalDays;
      existing.remaining = (existing.yearlyEntitlement + existing.carryForward + existing.accruedRounded)
        - existing.taken
        - existing.pending;
      return await existing.save();
    }

    const entitlement = new this.leaveEntitlementModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
      yearlyEntitlement: dto.totalDays,
      remaining: dto.totalDays,
    });
    return await entitlement.save();
  }

  private async deductLeaveBalance(employeeId: string, leaveTypeId: string, days: number): Promise<void> {
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    }).exec();

    if (entitlement) {
      // Update taken and recalculate remaining
      entitlement.taken += days;
      entitlement.remaining = Math.max(0,
        (entitlement.yearlyEntitlement + entitlement.carryForward + entitlement.accruedRounded)
        - entitlement.taken
        - entitlement.pending
      );

      await entitlement.save();
      console.log(`Successfully deducted ${days} days from employee ${employeeId}`);
    } else {
      console.warn(`No entitlement found for employee ${employeeId} and leave type ${leaveTypeId}`);
      throw new NotFoundException(`No leave entitlement found. Please assign entitlement for this leave type in Admin panel.`);
    }
  }

  // Calendar Methods
  async getHolidays(year: number): Promise<Calendar[]> {
    return await this.calendarModel.find({
      isHoliday: true,
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    }).exec();
  }

  async addHoliday(date: Date, name: string): Promise<Calendar> {
    const holiday = new this.calendarModel({
      date,
      name,
      isHoliday: true,
    });
    return await holiday.save();
  }
}
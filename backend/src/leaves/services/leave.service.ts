import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface LeaveRequest extends Document {
  [key: string]: any;
}

export interface LeaveEntitlement extends Document {
  [key: string]: any;
}

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel('LeaveRequest') private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel('LeaveEntitlement') private leaveEntitlementModel: Model<LeaveEntitlement>,
  ) {}

  async createRequest(requestData: any): Promise<LeaveRequest> {
    // Validate dates
    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);
    
    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate days (excluding weekends and holidays)
    const days = this.calculateLeaveDays(startDate, endDate);

    const request = new this.leaveRequestModel({
      ...requestData,
      days,
      submittedAt: new Date(),
    });

    return request.save();
  }

  async findAll(filters?: any): Promise<LeaveRequest[]> {
    const query = this.leaveRequestModel.find();
    if (filters?.employeeId) {
      query.where('employeeId').equals(filters.employeeId);
    }
    if (filters?.status) {
      query.where('status').equals(filters.status);
    }
    return query.populate('employeeId').populate('leaveTypeId').exec();
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel
      .findById(id)
      .populate('employeeId')
      .populate('leaveTypeId')
      .exec();
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return request;
  }

  async approveByManager(id: string, managerId: string, comments?: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    request.managerApproval = {
      approved: true,
      approvedBy: managerId,
      approvedAt: new Date(),
      comments,
    };
    request.status = 'manager_approved';

    return request.save();
  }

  async approveByHR(id: string, hrId: string, comments?: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    request.hrApproval = {
      approved: true,
      approvedBy: hrId,
      approvedAt: new Date(),
      comments,
    };
    request.status = 'hr_approved';

    // Update leave entitlement
    await this.updateLeaveBalance(request.employeeId.toString(), request.leaveTypeId.toString(), request.days);

    return request.save();
  }

  async reject(id: string, rejectedBy: string, reason: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    request.status = 'rejected';
    request.rejectedBy = rejectedBy;
    request.rejectedAt = new Date();
    request.rejectionReason = reason;

    return request.save();
  }

  async getEmployeeBalance(employeeId: string, leaveTypeId: string, year: number): Promise<LeaveEntitlement> {
    let entitlement = await this.leaveEntitlementModel
      .findOne({ employeeId, leaveTypeId, year })
      .exec();

    if (!entitlement) {
      entitlement = new this.leaveEntitlementModel({
        employeeId,
        leaveTypeId,
        year,
        totalDays: 0,
        accruedDays: 0,
        takenDays: 0,
        remainingDays: 0,
        pendingDays: 0,
        carryOverDays: 0,
      });
      await entitlement.save();
    }

    return entitlement;
  }

  private async updateLeaveBalance(employeeId: string, leaveTypeId: string, days: number): Promise<void> {
    const year = new Date().getFullYear();
    const entitlement = await this.getEmployeeBalance(employeeId, leaveTypeId, year);
    
    entitlement.takenDays += days;
    entitlement.remainingDays = entitlement.totalDays - entitlement.takenDays;
    
    await entitlement.save();
  }

  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    let days = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }
}


import { LeaveStatus } from '../enums/leave-status.enum';

export class LeaveRequestResponseDto {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  fromDate: Date;
  toDate: Date;
  durationDays: number;
  justification?: string;
  attachmentId?: string;
  status: LeaveStatus;
  approvedByManagerId?: string;
  approvedByHRId?: string;
  managerComments?: string;
  hrComments?: string;
  createdAt: Date;
  updatedAt: Date;
}
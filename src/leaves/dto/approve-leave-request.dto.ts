import { IsNotEmpty, IsMongoId, IsString, IsOptional } from 'class-validator';
import { LeaveStatus } from '../enums/leave-status.enum';

export class ApproveLeaveRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  approverId: string;

  @IsNotEmpty()
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;

  @IsString()
  @IsOptional()
  comments?: string;
}
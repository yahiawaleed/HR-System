import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { claims, claimsDocument } from './models/claims.schema';
import { disputes, disputesDocument } from './models/disputes.schema';
import { refunds, refundsDocument } from './models/refunds.schema';
import { ClaimStatus, DisputeStatus, RefundStatus } from './enums/payroll-tracking-enum';
import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service';

@Injectable()
export class PayrollTrackingService {
    constructor(
        @InjectModel(claims.name) private claimsModel: Model<claimsDocument>,
        @InjectModel(disputes.name) private disputesModel: Model<disputesDocument>,
        @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
        @Inject(forwardRef(() => PayrollExecutionService))
        private payrollExecutionService: PayrollExecutionService,
    ) { }

    // --- Claims Management ---

    async createClaim(data: any): Promise<claims> {
        try {
            const count = await this.claimsModel.countDocuments();
            const claimId = `CLAIM-${(count + 1).toString().padStart(4, '0')}`;
            
            const newClaim = new this.claimsModel({
                ...data,
                claimId,
                status: ClaimStatus.UNDER_REVIEW,
                employeeId: new Types.ObjectId(data.employeeId) // Ensure ObjectId conversion
            });
            return await newClaim.save();
        } catch (error) {
            console.error('Error creating claim:', error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getClaims(filter: any = {}): Promise<claims[]> {
        try {
            // If employeeId is provided in filter, ensure it's an ObjectId
            if (filter.employeeId) {
                if (Types.ObjectId.isValid(filter.employeeId)) {
                    filter.employeeId = new Types.ObjectId(filter.employeeId);
                } else {
                    // If invalid ObjectId, return empty array instead of crashing
                    console.warn(`Invalid employeeId format in filter: ${filter.employeeId}`);
                    return [];
                }
            }
            return await this.claimsModel.find(filter).populate('employeeId', 'firstName lastName').exec();
        } catch (error) {
            console.error('Error fetching claims:', error);
            throw new InternalServerErrorException('Failed to fetch claims');
        }
    }

    async getClaimById(id: string): Promise<claimsDocument> {
        const claim = await this.claimsModel.findById(id).populate('employeeId', 'firstName lastName').exec();
        if (!claim) throw new NotFoundException('Claim not found');
        return claim;
    }

    async updateClaimStatus(id: string, status: ClaimStatus, userId: string, role: string, comment?: string, approvedAmount?: number): Promise<claims> {
        const claim = await this.getClaimById(id);
        
        // Logic for status transitions based on role could be added here
        // For now, we allow direct updates as per requirements
        
        claim.status = status;
        if (comment) {
            if (status === ClaimStatus.REJECTED) claim.rejectionReason = comment;
            else claim.resolutionComment = comment;
        }

        if (approvedAmount !== undefined) {
            claim.approvedAmount = approvedAmount;
        }

        if (role === 'Payroll Specialist') claim.payrollSpecialistId = new Types.ObjectId(userId);
        if (role === 'Payroll Manager') claim.payrollManagerId = new Types.ObjectId(userId);
        if (role === 'Finance Staff') claim.financeStaffId = new Types.ObjectId(userId);

        const savedClaim = await claim.save();

        // If approved, create a refund record
        if (status === ClaimStatus.APPROVED) {
            await this.createRefundFromClaim(savedClaim);
        }

        return savedClaim;
    }

    // --- Disputes Management ---

    async createDispute(data: any): Promise<disputes> {
        try {
            const count = await this.disputesModel.countDocuments();
            const disputeId = `DISP-${(count + 1).toString().padStart(4, '0')}`;

            const newDispute = new this.disputesModel({
                ...data,
                disputeId,
                status: DisputeStatus.UNDER_REVIEW,
                employeeId: new Types.ObjectId(data.employeeId), // Ensure ObjectId conversion
                payslipId: new Types.ObjectId(data.payslipId) // Ensure ObjectId conversion
            });
            return await newDispute.save();
        } catch (error) {
            console.error('Error creating dispute:', error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getDisputes(filter: any = {}): Promise<disputes[]> {
        try {
            if (filter.employeeId) {
                if (Types.ObjectId.isValid(filter.employeeId)) {
                    filter.employeeId = new Types.ObjectId(filter.employeeId);
                } else {
                    console.warn(`Invalid employeeId format in filter: ${filter.employeeId}`);
                    return [];
                }
            }
            return await this.disputesModel.find(filter)
                .populate('employeeId', 'firstName lastName')
                .populate('payslipId')
                .exec();
        } catch (error) {
            console.error('Error fetching disputes:', error);
            throw new InternalServerErrorException('Failed to fetch disputes');
        }
    }

    async getDisputeById(id: string): Promise<disputesDocument> {
        const dispute = await this.disputesModel.findById(id)
            .populate('employeeId', 'firstName lastName')
            .populate('payslipId')
            .exec();
        if (!dispute) throw new NotFoundException('Dispute not found');
        return dispute;
    }

    async updateDisputeStatus(id: string, status: DisputeStatus, userId: string, role: string, comment?: string): Promise<disputes> {
        const dispute = await this.getDisputeById(id);

        dispute.status = status;
        if (comment) {
            if (status === DisputeStatus.REJECTED) dispute.rejectionReason = comment;
            else dispute.resolutionComment = comment;
        }

        if (role === 'Payroll Specialist') dispute.payrollSpecialistId = new Types.ObjectId(userId);
        if (role === 'Payroll Manager') dispute.payrollManagerId = new Types.ObjectId(userId);
        if (role === 'Finance Staff') dispute.financeStaffId = new Types.ObjectId(userId);

        const savedDispute = await dispute.save();

        // If approved, create a refund record (assuming dispute resolution involves payment)
        // Note: Logic might vary if dispute resolution involves deduction or other adjustments
        if (status === DisputeStatus.APPROVED) {
             // For simplicity, assuming dispute resolution might trigger a refund if applicable
             // In a real scenario, we might need more details on the refund amount
             // await this.createRefundFromDispute(savedDispute); 
        }

        return savedDispute;
    }

    // --- Refunds Management ---

    async createRefundFromClaim(claim: claimsDocument): Promise<refunds> {
        const refund = new this.refundsModel({
            claimId: claim._id,
            employeeId: claim.employeeId,
            refundDetails: {
                description: `Refund for Claim ${claim.claimId}: ${claim.description}`,
                amount: claim.approvedAmount || claim.amount
            },
            status: RefundStatus.PENDING
        });
        return refund.save();
    }

    async getPendingRefunds(employeeId?: string): Promise<refunds[]> {
        const filter: any = { status: RefundStatus.PENDING };
        if (employeeId) filter.employeeId = employeeId;
        return this.refundsModel.find(filter).exec();
    }
    
    async markRefundsAsPaid(refundIds: string[], payrollRunId: string): Promise<void> {
        await this.refundsModel.updateMany(
            { _id: { $in: refundIds } },
            { 
                status: RefundStatus.PAID,
                paidInPayrollRunId: new Types.ObjectId(payrollRunId)
            }
        );
    }

    // --- Payslip Access ---
    
    async getEmployeePayslips(employeeId: string): Promise<any[]> {
        return this.payrollExecutionService.getPayslipsByEmployee(employeeId);
    }

    async getPayslipById(id: string): Promise<any> {
        return this.payrollExecutionService.getPayslipById(id);
    }
}

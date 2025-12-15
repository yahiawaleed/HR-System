import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreateClaimDto } from '../dto/create-claim.dto';

export interface Claim extends Document {
  payrollId: any;
  employeeId: any;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  status: string;
  submittedAt: Date;
  decisionAt?: Date;
  approverId?: any;
  attachments?: any[];
}

@Injectable()
export class ClaimService {
  constructor(@InjectModel('Claim') private claimModel: Model<Claim>) {}

  async create(createClaimDto: CreateClaimDto): Promise<Claim> {
    const createdClaim = new this.claimModel(createClaimDto);
    return createdClaim.save();
  }

  async findAll(): Promise<Claim[]> {
    return this.claimModel.find().populate('employeeId').populate('approverId').exec();
  }

  async findOne(id: string): Promise<Claim | null> {
    return this.claimModel.findById(id).populate('employeeId').populate('approverId').exec();
  }

  async updateStatus(id: string, status: string, approverId: string): Promise<Claim | null> {
    return this.claimModel
      .findByIdAndUpdate(id, { status, approverId, decisionAt: new Date() }, { new: true })
      .exec();
  }
}


import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreateDisputeDto } from '../dto/create-dispute.dto';

export interface Dispute extends Document {
  payrollId: any;
  employeeId: any;
  reason: string;
  status: string;
  createdAt: Date;
  resolvedAt?: Date;
}

@Injectable()
export class DisputeService {
  constructor(@InjectModel('Dispute') private disputeModel: Model<Dispute>) {}

  async create(createDisputeDto: CreateDisputeDto): Promise<Dispute> {
    const createdDispute = new this.disputeModel(createDisputeDto);
    return createdDispute.save();
  }

  async findAll(): Promise<Dispute[]> {
    return this.disputeModel.find().populate('employeeId').exec();
  }

  async findOne(id: string): Promise<Dispute | null> {
    return this.disputeModel.findById(id).populate('employeeId').exec();
  }

  async updateStatus(id: string, status: string): Promise<Dispute | null> {
    return this.disputeModel
      .findByIdAndUpdate(
        id,
        { status, resolvedAt: status === 'resolved' ? new Date() : null },
        { new: true },
      )
      .exec();
  }
}


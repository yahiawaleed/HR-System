import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payslip, PayslipDocument } from './schemas/payslip.schema';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(Payslip.name) private payslipModel: Model<PayslipDocument>,
  ) {}

  // FIX: Change return type to allow 'null'
  async findOne(id: string): Promise<Payslip | null> {
    return this.payslipModel.findById(id).exec();
  }
}
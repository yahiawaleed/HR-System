import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface Shift extends Document {
  [key: string]: any;
}

@Injectable()
export class ShiftService {
  constructor(@InjectModel('Shift') private shiftModel: Model<Shift>) {}

  async create(shiftData: any, userId: string): Promise<Shift> {
    const shift = new this.shiftModel({ ...shiftData, createdBy: userId });
    return shift.save();
  }

  async findAll(): Promise<Shift[]> {
    return this.shiftModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftModel.findById(id).exec();
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async update(id: string, updateData: any): Promise<Shift> {
    const shift = await this.shiftModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }
}


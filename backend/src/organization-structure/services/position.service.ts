import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreatePositionDto } from '../dto/create-position.dto';

export interface Position extends Document {
  [key: string]: any;
}

@Injectable()
export class PositionService {
  constructor(@InjectModel('Position') private positionModel: Model<Position>) {}

  async create(createPositionDto: CreatePositionDto): Promise<Position> {
    const position = new this.positionModel(createPositionDto);
    return position.save();
  }

  async findAll(): Promise<Position[]> {
    return this.positionModel
      .find({ isActive: true })
      .populate('departmentId')
      .populate('reportsToPositionId')
      .populate('payGradeId')
      .exec();
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionModel
      .findById(id)
      .populate('departmentId')
      .populate('reportsToPositionId')
      .populate('payGradeId')
      .exec();
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return position;
  }

  async findByDepartment(departmentId: string): Promise<Position[]> {
    return this.positionModel.find({ departmentId, isActive: true }).exec();
  }

  async update(id: string, updateDto: Partial<CreatePositionDto>, userId: string): Promise<Position> {
    const position = await this.positionModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return position;
  }

  async deactivate(id: string, userId: string): Promise<Position> {
    const position = await this.positionModel.findByIdAndUpdate(
      id,
      { isActive: false, deactivatedAt: new Date(), deactivatedBy: userId },
      { new: true },
    ).exec();
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return position;
  }
}


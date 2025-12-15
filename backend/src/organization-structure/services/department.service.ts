import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreateDepartmentDto } from '../dto/create-department.dto';

export interface Department extends Document {
  [key: string]: any;
}

@Injectable()
export class DepartmentService {
  constructor(@InjectModel('Department') private departmentModel: Model<Department>) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = new this.departmentModel(createDepartmentDto);
    return department.save();
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find({ isActive: true }).populate('headId').populate('parentDepartmentId').exec();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentModel.findById(id).populate('headId').populate('parentDepartmentId').exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(id: string, updateDto: Partial<CreateDepartmentDto>, userId: string): Promise<Department> {
    const department = await this.departmentModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async deactivate(id: string, userId: string): Promise<Department> {
    const department = await this.departmentModel.findByIdAndUpdate(
      id,
      { isActive: false, deactivatedAt: new Date(), deactivatedBy: userId },
      { new: true },
    ).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }
}


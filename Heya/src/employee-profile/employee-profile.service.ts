import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmployeeProfile } from './models/employee-profile.schema';
import { Model } from 'mongoose';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfile>,
  ) {}

  async findAll() {
    return this.employeeModel.find().exec();
  }

  async findOne(id: string) {
    return this.employeeModel.findById(id).exec();
  }

  async create(data: any) {
    const employee = new this.employeeModel(data);
    return employee.save();
  }
}

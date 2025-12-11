import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from './models/employee-profile.schema';

@Injectable()
export class EmployeeProfileService {
    constructor(
        @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfileDocument>,
    ) { }

    async create(createEmployeeDto: any): Promise<EmployeeProfile> {
        const createdEmployee = new this.employeeModel(createEmployeeDto);
        return createdEmployee.save();
    }

    async findAll(): Promise<EmployeeProfile[]> {
        return this.employeeModel.find().exec();
    }

    async findOne(id: string): Promise<EmployeeProfile | null> {
        return this.employeeModel.findById(id).exec();
    }

    async update(id: string, updateEmployeeDto: any): Promise<EmployeeProfile | null> {
        return this.employeeModel
            .findByIdAndUpdate(id, updateEmployeeDto, { new: true })
            .exec();
    }
}

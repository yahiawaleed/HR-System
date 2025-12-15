import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';

export interface Employee extends Document {
  [key: string]: any;
}

@Injectable()
export class EmployeeService {
  constructor(@InjectModel('Employee') private employeeModel: Model<Employee>) {}

  async create(createEmployeeDto: CreateEmployeeDto, userId: string): Promise<Employee> {
    const employee = new this.employeeModel({
      ...createEmployeeDto,
      createdBy: userId,
    });
    return employee.save();
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel
      .find()
      .populate('departmentId')
      .populate('positionId')
      .populate('managerId')
      .populate('payGradeId')
      .exec();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeModel
      .findById(id)
      .populate('departmentId')
      .populate('positionId')
      .populate('managerId')
      .populate('payGradeId')
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<Employee | null> {
    return this.employeeModel.findOne({ employeeNumber }).exec();
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, userId: string): Promise<Employee> {
    const employee = await this.employeeModel
      .findByIdAndUpdate(
        id,
        { ...updateEmployeeDto, updatedBy: userId, lastUpdated: new Date() },
        { new: true },
      )
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findByDepartment(departmentId: string): Promise<Employee[]> {
    return this.employeeModel.find({ departmentId }).exec();
  }

  async findByManager(managerId: string): Promise<Employee[]> {
    return this.employeeModel.find({ managerId }).exec();
  }
}


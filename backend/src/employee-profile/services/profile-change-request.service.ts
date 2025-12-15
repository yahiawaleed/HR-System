import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreateProfileChangeRequestDto } from '../dto/profile-change-request.dto';
import { ReviewChangeRequestDto } from '../dto/profile-change-request.dto';
import { EmployeeService } from './employee.service';

export interface ProfileChangeRequest extends Document {
  [key: string]: any;
}

@Injectable()
export class ProfileChangeRequestService {
  constructor(
    @InjectModel('ProfileChangeRequest')
    private changeRequestModel: Model<ProfileChangeRequest>,
    private employeeService: EmployeeService,
  ) {}

  async create(
    createRequestDto: CreateProfileChangeRequestDto,
    userId: string,
  ): Promise<ProfileChangeRequest> {
    const employee = await this.employeeService.findOne(createRequestDto.employeeId);
    const oldValue = employee[createRequestDto.fieldName];

    const request = new this.changeRequestModel({
      ...createRequestDto,
      oldValue,
      requestedBy: userId,
    });
    return request.save();
  }

  async findAll(): Promise<ProfileChangeRequest[]> {
    return this.changeRequestModel
      .find()
      .populate('employeeId')
      .populate('requestedBy')
      .populate('reviewedBy')
      .exec();
  }

  async findPending(): Promise<ProfileChangeRequest[]> {
    return this.changeRequestModel
      .find({ status: 'pending' })
      .populate('employeeId')
      .populate('requestedBy')
      .exec();
  }

  async review(
    id: string,
    reviewDto: ReviewChangeRequestDto,
    reviewerId: string,
  ): Promise<ProfileChangeRequest> {
    const request = await this.changeRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Change request with ID ${id} not found`);
    }

    if (reviewDto.status === 'approved') {
      // Apply the change to the employee profile
      await this.employeeService.update(
        request.employeeId.toString(),
        { [request.fieldName]: request.newValue },
        reviewerId,
      );
    }

    request.status = reviewDto.status;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewDto.reviewNotes;

    return request.save();
  }
}


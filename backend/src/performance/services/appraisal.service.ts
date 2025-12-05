import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface Appraisal extends Document {
  [key: string]: any;
}

export interface AppraisalCycle extends Document {
  [key: string]: any;
}

export interface AppraisalTemplate extends Document {
  [key: string]: any;
}

@Injectable()
export class AppraisalService {
  constructor(
    @InjectModel('Appraisal') private appraisalModel: Model<Appraisal>,
    @InjectModel('AppraisalCycle') private cycleModel: Model<AppraisalCycle>,
    @InjectModel('AppraisalTemplate') private templateModel: Model<AppraisalTemplate>,
  ) {}

  // Template methods
  async createTemplate(templateData: any, userId: string): Promise<AppraisalTemplate> {
    const template = new this.templateModel({ ...templateData, createdBy: userId });
    return template.save();
  }

  async findAllTemplates(): Promise<AppraisalTemplate[]> {
    return this.templateModel.find({ isActive: true }).exec();
  }

  // Cycle methods
  async createCycle(cycleData: any, userId: string): Promise<AppraisalCycle> {
    const cycle = new this.cycleModel({ ...cycleData, createdBy: userId });
    return cycle.save();
  }

  async findAllCycles(): Promise<AppraisalCycle[]> {
    return this.cycleModel.find().populate('templateId').exec();
  }

  // Appraisal methods
  async create(appraisalData: any): Promise<Appraisal> {
    const appraisal = new this.appraisalModel(appraisalData);
    return appraisal.save();
  }

  async findAll(): Promise<Appraisal[]> {
    return this.appraisalModel
      .find()
      .populate('employeeId')
      .populate('reviewerId')
      .populate('cycleId')
      .exec();
  }

  async findOne(id: string): Promise<Appraisal> {
    const appraisal = await this.appraisalModel
      .findById(id)
      .populate('employeeId')
      .populate('reviewerId')
      .populate('cycleId')
      .exec();
    if (!appraisal) {
      throw new NotFoundException(`Appraisal with ID ${id} not found`);
    }
    return appraisal;
  }

  async findByEmployee(employeeId: string): Promise<Appraisal[]> {
    return this.appraisalModel.find({ employeeId }).populate('cycleId').exec();
  }

  async update(id: string, updateData: any): Promise<Appraisal> {
    const appraisal = await this.appraisalModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!appraisal) {
      throw new NotFoundException(`Appraisal with ID ${id} not found`);
    }
    return appraisal;
  }

  async publish(id: string): Promise<Appraisal> {
    return this.update(id, { status: 'published', publishedAt: new Date() });
  }
}


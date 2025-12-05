import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface OffboardingChecklist extends Document {
  [key: string]: any;
}

@Injectable()
export class OffboardingService {
  constructor(
    @InjectModel('OffboardingChecklist') private offboardingChecklistModel: Model<OffboardingChecklist>,
  ) {}

  async createChecklist(checklistData: any, userId: string): Promise<OffboardingChecklist> {
    const checklist = new this.offboardingChecklistModel({
      ...checklistData,
      initiatedBy: userId,
    });
    return checklist.save();
  }

  async findAll(employeeId?: string): Promise<OffboardingChecklist[]> {
    const query = this.offboardingChecklistModel.find();
    if (employeeId) {
      query.where('employeeId').equals(employeeId);
    }
    return query.populate('employeeId').exec();
  }

  async updateTaskStatus(
    checklistId: string,
    taskIndex: number,
    status: string,
  ): Promise<OffboardingChecklist> {
    const checklist = await this.offboardingChecklistModel.findById(checklistId).exec();
    if (!checklist) {
      throw new NotFoundException(`Offboarding checklist with ID ${checklistId} not found`);
    }

    if (checklist.tasks[taskIndex]) {
      checklist.tasks[taskIndex].status = status;
      if (status === 'completed') {
        checklist.tasks[taskIndex].completedAt = new Date();
      }
    }

    // Check if all tasks are completed
    const allCompleted = checklist.tasks.every((task: any) => task.status === 'completed');
    if (allCompleted) {
      checklist.status = 'completed';
      checklist.completedAt = new Date();
    } else {
      checklist.status = 'in_progress';
    }

    return checklist.save();
  }
}


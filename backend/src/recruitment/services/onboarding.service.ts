import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface OnboardingTask extends Document {
  [key: string]: any;
}

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel('OnboardingTask') private onboardingTaskModel: Model<OnboardingTask>,
  ) {}

  async createTask(taskData: any): Promise<OnboardingTask> {
    const task = new this.onboardingTaskModel(taskData);
    return task.save();
  }

  async createTasksForEmployee(employeeId: string, tasks: any[]): Promise<any[]> {
    const createdTasks = tasks.map((task) => ({
      ...task,
      employeeId,
    }));
    return this.onboardingTaskModel.insertMany(createdTasks);
  }

  async findAll(employeeId?: string): Promise<OnboardingTask[]> {
    const query = this.onboardingTaskModel.find();
    if (employeeId) {
      query.where('employeeId').equals(employeeId);
    }
    return query.populate('employeeId').populate('assignedTo').exec();
  }

  async updateTaskStatus(id: string, status: string): Promise<OnboardingTask> {
    const task = await this.onboardingTaskModel.findByIdAndUpdate(
      id,
      { status, completedAt: status === 'completed' ? new Date() : null },
      { new: true },
    ).exec();
    if (!task) {
      throw new NotFoundException(`Onboarding task with ID ${id} not found`);
    }
    return task;
  }
}


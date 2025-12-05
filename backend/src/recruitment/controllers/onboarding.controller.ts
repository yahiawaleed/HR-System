import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('tasks')
  async createTask(@Body() taskData: any) {
    return this.onboardingService.createTask(taskData);
  }

  @Post('tasks/bulk')
  async createTasksForEmployee(@Body() body: { employeeId: string; tasks: any[] }) {
    return this.onboardingService.createTasksForEmployee(body.employeeId, body.tasks);
  }

  @Get('tasks')
  async findAll(@Query('employeeId') employeeId?: string) {
    return this.onboardingService.findAll(employeeId);
  }

  @Patch('tasks/:id/status')
  async updateTaskStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.onboardingService.updateTaskStatus(id, body.status);
  }
}


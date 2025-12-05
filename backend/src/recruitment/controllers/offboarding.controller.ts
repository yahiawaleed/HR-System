import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { OffboardingService } from '../services/offboarding.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('offboarding')
@UseGuards(JwtAuthGuard)
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  @Post('checklists')
  async createChecklist(@Body() checklistData: any, @Request() req) {
    return this.offboardingService.createChecklist(checklistData, req.user.userId);
  }

  @Get('checklists')
  async findAll(@Query('employeeId') employeeId?: string) {
    return this.offboardingService.findAll(employeeId);
  }

  @Patch('checklists/:id/tasks/:taskIndex')
  async updateTaskStatus(
    @Param('id') checklistId: string,
    @Param('taskIndex') taskIndex: string,
    @Body() body: { status: string },
  ) {
    return this.offboardingService.updateTaskStatus(checklistId, parseInt(taskIndex), body.status);
  }
}


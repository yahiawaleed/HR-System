import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AppraisalService } from '../services/appraisal.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('performance')
@UseGuards(JwtAuthGuard)
export class AppraisalController {
  constructor(private readonly appraisalService: AppraisalService) {}

  // Template endpoints
  @Post('templates')
  async createTemplate(@Body() templateData: any, @Request() req) {
    return this.appraisalService.createTemplate(templateData, req.user.userId);
  }

  @Get('templates')
  async findAllTemplates() {
    return this.appraisalService.findAllTemplates();
  }

  // Cycle endpoints
  @Post('cycles')
  async createCycle(@Body() cycleData: any, @Request() req) {
    return this.appraisalService.createCycle(cycleData, req.user.userId);
  }

  @Get('cycles')
  async findAllCycles() {
    return this.appraisalService.findAllCycles();
  }

  // Appraisal endpoints
  @Post('appraisals')
  async create(@Body() appraisalData: any) {
    return this.appraisalService.create(appraisalData);
  }

  @Get('appraisals')
  async findAll() {
    return this.appraisalService.findAll();
  }

  @Get('appraisals/:id')
  async findOne(@Param('id') id: string) {
    return this.appraisalService.findOne(id);
  }

  @Get('appraisals/employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.appraisalService.findByEmployee(employeeId);
  }

  @Patch('appraisals/:id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.appraisalService.update(id, updateData);
  }

  @Patch('appraisals/:id/publish')
  async publish(@Param('id') id: string) {
    return this.appraisalService.publish(id);
  }
}


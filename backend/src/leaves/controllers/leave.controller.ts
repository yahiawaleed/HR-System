import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('requests')
  async createRequest(@Body() requestData: any) {
    return this.leaveService.createRequest(requestData);
  }

  @Get('requests')
  async findAll(@Query() query: any) {
    return this.leaveService.findAll(query);
  }

  @Get('requests/:id')
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch('requests/:id/approve-manager')
  async approveByManager(
    @Param('id') id: string,
    @Body() body: { comments?: string },
    @Request() req,
  ) {
    return this.leaveService.approveByManager(id, req.user.userId, body.comments);
  }

  @Patch('requests/:id/approve-hr')
  async approveByHR(
    @Param('id') id: string,
    @Body() body: { comments?: string },
    @Request() req,
  ) {
    return this.leaveService.approveByHR(id, req.user.userId, body.comments);
  }

  @Patch('requests/:id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.leaveService.reject(id, req.user.userId, body.reason);
  }

  @Get('balance/:employeeId')
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId: string,
    @Query('year') year: number,
  ) {
    const yearValue = year || new Date().getFullYear();
    return this.leaveService.getEmployeeBalance(employeeId, leaveTypeId, yearValue);
  }
}


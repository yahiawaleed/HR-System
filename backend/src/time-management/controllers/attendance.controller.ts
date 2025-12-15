import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  async clockIn(@Body() body: { employeeId: string; clockInTime?: Date }, @Request() req) {
    const clockInTime = body.clockInTime ? new Date(body.clockInTime) : new Date();
    return this.attendanceService.clockIn(body.employeeId, clockInTime);
  }

  @Post('clock-out')
  async clockOut(@Body() body: { employeeId: string; clockOutTime?: Date }, @Request() req) {
    const clockOutTime = body.clockOutTime ? new Date(body.clockOutTime) : new Date();
    return this.attendanceService.clockOut(body.employeeId, clockOutTime);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.attendanceService.findAll(query);
  }

  @Patch(':id/correct')
  async correctAttendance(
    @Param('id') id: string,
    @Body() correctionData: any,
    @Request() req,
  ) {
    return this.attendanceService.correctAttendance(id, correctionData, req.user.userId);
  }
}


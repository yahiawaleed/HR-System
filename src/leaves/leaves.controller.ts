import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { LeaveRequest } from './models/leave-request.schema';
import { LeaveType } from './models/leave-type.schema';
import { LeavePolicy } from './models/leave-policy.schema';

@Controller('leaves')
@UsePipes(new ValidationPipe({ transform: true }))
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // Leave Requests Endpoints
  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  async createLeaveRequest(@Body() createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    return await this.leavesService.createLeaveRequest(createLeaveRequestDto);
  }

  @Get('requests')
  async findAllLeaveRequests(@Query('employeeId') employeeId?: string): Promise<LeaveRequest[]> {
    return await this.leavesService.findAllLeaveRequests(employeeId);
  }

  @Get('requests/:id')
  async findLeaveRequestById(@Param('id') id: string): Promise<LeaveRequest> {
    return await this.leavesService.findLeaveRequestById(id);
  }

  @Put('requests/:id')
  async updateLeaveRequest(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return await this.leavesService.updateLeaveRequest(id, updateLeaveRequestDto);
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLeaveRequest(@Param('id') id: string): Promise<void> {
    await this.leavesService.deleteLeaveRequest(id);
  }

  @Put('requests/:id/approve')
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return await this.leavesService.approveLeaveRequest(id, approveDto);
  }

  @Put('requests/:id/hr-review')
  async hrReviewLeaveRequest(
    @Param('id') id: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return await this.leavesService.hrReviewLeaveRequest(id, approveDto);
  }

  // Leave Types Endpoints
  @Post('types')
  @HttpCode(HttpStatus.CREATED)
  async createLeaveType(@Body() createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    return await this.leavesService.createLeaveType(createLeaveTypeDto);
  }

  @Get('types')
  async findAllLeaveTypes(): Promise<LeaveType[]> {
    return await this.leavesService.findAllLeaveTypes();
  }

  @Get('types/:id')
  async findLeaveTypeById(@Param('id') id: string): Promise<LeaveType> {
    return await this.leavesService.findLeaveTypeById(id);
  }

  // Leave Policies Endpoints
  @Post('policies')
  @HttpCode(HttpStatus.CREATED)
  async createLeavePolicy(@Body() createLeavePolicyDto: CreateLeavePolicyDto): Promise<LeavePolicy> {
    return await this.leavesService.createLeavePolicy(createLeavePolicyDto);
  }

  @Get('policies')
  async findAllLeavePolicies(): Promise<LeavePolicy[]> {
    return await this.leavesService.findAllLeavePolicies();
  }

  // Balance Endpoints
  @Get('balance/:employeeId/:leaveTypeId')
  async getEmployeeLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
  ) {
    return await this.leavesService.getEmployeeLeaveBalance(employeeId, leaveTypeId);
  }

  // Calendar Endpoints
  @Get('holidays/:year')
  async getHolidays(@Param('year') year: number) {
    return await this.leavesService.getHolidays(year);
  }

  @Post('holidays')
  @HttpCode(HttpStatus.CREATED)
  async addHoliday(@Body() body: { date: Date; name: string }) {
    return await this.leavesService.addHoliday(body.date, body.name);
  }
}
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  Header,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { EmployeeProfileService } from './employee-profile.service';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { CreateQualificationDto } from './dto/qualification.dto';
import { AssignRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CreateCandidateDto, UpdateCandidateStatusDto, ConvertCandidateToEmployeeDto } from './dto/candidate.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ALL_EMPLOYEE_ROLES } from './enums/employee-profile.enums';

@Controller('api/employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async getAllEmployees(@Query() query: PaginationQueryDto) {
    return this.employeeProfileService.getAllEmployees(query);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    try {
      const userId = req.user?.userId;
      console.log('[GET PROFILE] Request for user:', userId, 'Role:', req.user?.role);

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const profile = await this.employeeProfileService.getEmployeeById(userId);
      console.log('[GET PROFILE] Successfully retrieved profile for:', userId);
      return profile;
    } catch (error) {
      console.error('[GET PROFILE] Error:', error.message);
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Admin', 'HR Admin', 'HR Manager')
  async createEmployee(@Body() createDto: CreateEmployeeProfileDto) {
    return this.employeeProfileService.createEmployeeProfile(createDto);
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Admin', 'HR Admin', 'HR Manager')
  @Header('Content-Type', 'text/csv')
  async exportEmployeesToCsv(@Res() res: Response) {
    const csv = await this.employeeProfileService.exportEmployeesToCsv();
    res.set({
      'Content-Disposition': `attachment; filename=employees-${new Date().toISOString().split('T')[0]}.csv`,
    });
    res.send(csv);
  }

  @Get('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Admin', 'Recruiter', 'HR Manager', 'HR Employee')
  async getAllCandidates(@Query() query: PaginationQueryDto) {
    return this.employeeProfileService.getAllCandidates(query);
  }

  @Post('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Recruiter', 'HR Manager')
  async createCandidate(@Body() createDto: CreateCandidateDto) {
    return this.employeeProfileService.createCandidate(createDto);
  }

  @Get('candidates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Recruiter', 'HR Manager', 'HR Employee')
  async getCandidateById(@Param('id') id: string) {
    return this.employeeProfileService.getCandidateById(id);
  }

  @Post('candidates/:id/convert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR Manager', 'HR Admin')
  async convertCandidateToEmployee(@Param('id') id: string, @Body() convertDto: ConvertCandidateToEmployeeDto) {
    return this.employeeProfileService.convertCandidateToEmployee(id, convertDto);
  }

  @Patch('candidates/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Recruiter', 'HR Manager')
  async updateCandidateStatus(@Param('id') id: string, @Body() updateDto: UpdateCandidateStatusDto) {
    return this.employeeProfileService.updateCandidateStatus(id, updateDto);
  }

  @Get('change-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async getAllChangeRequests(@Query() query: PaginationQueryDto) {
    return this.employeeProfileService.getAllChangeRequests(query);
  }

  @Post('change-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async createChangeRequest(@Req() req: any, @Body() createDto: CreateChangeRequestDto) {
    const employeeId = req.user?.userId;
    return this.employeeProfileService.createChangeRequest(employeeId, createDto);
  }

  @Patch('change-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Admin', 'HR Admin', 'HR Manager')
  async approveChangeRequest(@Param('id') id: string) {
    return this.employeeProfileService.approveChangeRequest(id);
  }

  @Patch('change-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Admin', 'HR Admin', 'HR Manager')
  async rejectChangeRequest(@Param('id') id: string) {
    return this.employeeProfileService.rejectChangeRequest(id);
  }

  @Patch(':id/contact')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async updateContactInfo(@Param('id') id: string, @Body() updateDto: UpdateContactInfoDto, @Req() req: any) {
    // Employees can only update their own contact info, HR roles can update anyone's
    const userId = req.user?.userId;
    const userRoles = req.user?.roles || [];
    const isHR = userRoles.some((role: string) => ['HR Admin', 'HR Manager', 'System Admin'].includes(role));

    if (!isHR && userId !== id) {
      throw new Error('You can only update your own contact information');
    }

    return this.employeeProfileService.updateContactInfo(id, updateDto);
  }

  @Post(':id/picture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    // Employees can only upload their own picture, HR roles can upload for anyone
    const userId = req.user?.userId;
    const userRoles = req.user?.roles || [];
    const isHR = userRoles.some((role: string) => ['HR Admin', 'HR Manager', 'System Admin'].includes(role));

    if (!isHR && userId !== id) {
      throw new Error('You can only upload your own profile picture');
    }

    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.employeeProfileService.uploadProfilePicture(id, file);
  }

  @Get(':id/qualifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async getQualifications(@Param('id') id: string) {
    return this.employeeProfileService.getQualifications(id);
  }

  @Post(':id/qualifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async addQualification(@Param('id') id: string, @Body() createDto: CreateQualificationDto) {
    return this.employeeProfileService.addQualification(id, createDto);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async getAllRoles() {
    return this.employeeProfileService.getAllRoles();
  }

  @Get(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async getEmployeeRoles(@Param('id') id: string) {
    return this.employeeProfileService.getEmployeeRoles(id);
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  async assignRoles(@Param('id') id: string, @Body() assignDto: AssignRoleDto) {
    return this.employeeProfileService.assignRoles(id, assignDto);
  }

  @Patch(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  async updateRoles(@Param('id') id: string, @Body() updateDto: UpdateRoleDto) {
    return this.employeeProfileService.updateRoles(id, updateDto);
  }

  @Patch(':id/roles/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  async deactivateRoles(@Param('id') id: string) {
    return this.employeeProfileService.deactivateRoles(id);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  @Header('Content-Type', 'application/pdf')
  async exportEmployeePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.employeeProfileService.exportEmployeeProfileToPdf(id);
    res.set({
      'Content-Disposition': `attachment; filename=employee-profile-${id}.pdf`,
    });
    res.send(pdfBuffer);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async updateEmployee(@Param('id') id: string, @Body() updateDto: UpdateEmployeeProfileDto) {
    return this.employeeProfileService.updateEmployeeProfile(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR Admin', 'HR Manager')
  async deactivateEmployee(@Param('id') id: string, @Body() body: { status: string }) {
    return this.employeeProfileService.deactivateEmployee(id, body.status as any);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ALL_EMPLOYEE_ROLES)
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeProfileService.getEmployeeById(id);
  }
}

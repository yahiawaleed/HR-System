import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { EmployeeProfile, EmployeeProfileDocument } from './models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from './models/employee-system-role.schema';
import { EmployeeQualification, EmployeeQualificationDocument } from './models/qualification.schema';
import { Candidate, CandidateDocument } from './models/candidate.schema';
import { EmployeeProfileChangeRequest, EmployeeProfileChangeRequestDocument } from './models/ep-change-request.schema';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { EmployeeProfileResponseDto } from './dto/employee-profile-response.dto';
import { CreateQualificationDto } from './dto/qualification.dto';
import { AssignRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CreateCandidateDto, UpdateCandidateStatusDto, ConvertCandidateToEmployeeDto } from './dto/candidate.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';
import { NotificationService } from '../notification/notification.service';
import { PaginationQueryDto } from './dto/pagination.dto';
import { SystemRole, EmployeeStatus, ProfileChangeStatus, CandidateStatus } from './enums/employee-profile.enums';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(EmployeeQualification.name)
    private employeeQualificationModel: Model<EmployeeQualificationDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(EmployeeProfileChangeRequest.name)
    private changeRequestModel: Model<EmployeeProfileChangeRequestDocument>,
    private notificationService: NotificationService,
  ) { }

  /**
   * Helper method to convert string ID to ObjectId if valid
   * Skips invalid/placeholder values like 'string'
   */
  private isValidObjectId(id: string | undefined): boolean {
    if (!id || typeof id !== 'string') return false;
    const trimmed = id.trim();
    if (!trimmed || trimmed === 'string') return false; // Skip placeholder
    return Types.ObjectId.isValid(trimmed);
  }

  async create(createEmployeeProfileDto: CreateEmployeeProfileDto): Promise<EmployeeProfileResponseDto> {
    // Check if employee already exists
    const existingEmail = await this.employeeProfileModel.findOne({
      workEmail: createEmployeeProfileDto.workEmail,
    });
    if (existingEmail) {
      throw new ConflictException('Employee with this email already exists');
    }

    const existingEmployee = await this.employeeProfileModel.findOne({
      employeeNumber: createEmployeeProfileDto.employeeNumber,
    });
    if (existingEmployee) {
      throw new ConflictException('Employee with this number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createEmployeeProfileDto.password, 10);

    // Create employee profile
    const newEmployee = new this.employeeProfileModel({
      ...createEmployeeProfileDto,
      password: hashedPassword,
      fullName: `${createEmployeeProfileDto.firstName} ${createEmployeeProfileDto.middleName || ''} ${createEmployeeProfileDto.lastName}`.trim(),
      status: EmployeeStatus.ACTIVE,
      statusEffectiveFrom: new Date(),
      primaryPositionId: createEmployeeProfileDto.primaryPositionId
        ? new Types.ObjectId(createEmployeeProfileDto.primaryPositionId)
        : undefined,
      primaryDepartmentId: createEmployeeProfileDto.primaryDepartmentId
        ? new Types.ObjectId(createEmployeeProfileDto.primaryDepartmentId)
        : undefined,
      payGradeId: createEmployeeProfileDto.payGradeId
        ? new Types.ObjectId(createEmployeeProfileDto.payGradeId)
        : undefined,
    });

    const savedEmployee = await newEmployee.save();

    // Create system role for the employee
    const systemRole = new this.employeeSystemRoleModel({
      employeeProfileId: savedEmployee._id,
      roles: [SystemRole.DEPARTMENT_EMPLOYEE],
      permissions: ['view_own_profile', 'update_own_profile'],
      isActive: true,
    });
    await systemRole.save();

    return this.mapToResponseDto(savedEmployee);
  }

  async findAll(skip = 0, limit = 10, status?: EmployeeStatus): Promise<{
    data: EmployeeProfileResponseDto[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const total = await this.employeeProfileModel.countDocuments(filter);
    const employees = await this.employeeProfileModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    return {
      data: employees.map(emp => this.mapToResponseDto(emp)),
      total,
      skip,
      limit,
    };
  }

  async findById(id: string): Promise<EmployeeProfileResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const employee = await this.employeeProfileModel
      .findById(id)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .populate('accessProfileId')
      .exec();

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.mapToResponseDto(employee);
  }

  async findByEmail(email: string): Promise<EmployeeProfileResponseDto> {
    const employee = await this.employeeProfileModel
      .findOne({ workEmail: email })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    if (!employee) {
      throw new NotFoundException(`Employee with email ${email} not found`);
    }

    return this.mapToResponseDto(employee);
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<EmployeeProfileResponseDto> {
    const employee = await this.employeeProfileModel
      .findOne({ employeeNumber })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    if (!employee) {
      throw new NotFoundException(`Employee with number ${employeeNumber} not found`);
    }

    return this.mapToResponseDto(employee);
  }

  async update(id: string, updateEmployeeProfileDto: UpdateEmployeeProfileDto): Promise<EmployeeProfileResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    // Check for duplicate email if updating
    if (updateEmployeeProfileDto.workEmail) {
      const existing = await this.employeeProfileModel.findOne({
        workEmail: updateEmployeeProfileDto.workEmail,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData: any = { ...updateEmployeeProfileDto };

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    // Update full name if any name field changed
    if (updateData.firstName || updateData.middleName || updateData.lastName) {
      const employee = await this.employeeProfileModel.findById(id);
      if (employee) {
        updateData.fullName = `${updateData.firstName || employee.firstName} ${updateData.middleName || employee.middleName || ''} ${updateData.lastName || employee.lastName}`.trim();
      }
    }

    // Update status effective from if status changes
    if (updateData.status) {
      updateData.statusEffectiveFrom = new Date();
    }

    // Convert string IDs to ObjectId only if valid
    if (this.isValidObjectId(updateData.primaryPositionId as string)) {
      updateData.primaryPositionId = new Types.ObjectId(updateData.primaryPositionId as string);
    } else {
      delete updateData.primaryPositionId;
    }
    if (this.isValidObjectId(updateData.primaryDepartmentId as string)) {
      updateData.primaryDepartmentId = new Types.ObjectId(updateData.primaryDepartmentId as string);
    } else {
      delete updateData.primaryDepartmentId;
    }
    if (this.isValidObjectId(updateData.payGradeId as string)) {
      updateData.payGradeId = new Types.ObjectId(updateData.payGradeId as string);
    } else {
      delete updateData.payGradeId;
    }

    const updatedEmployee = await this.employeeProfileModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    if (!updatedEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedEmployee);
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const result = await this.employeeProfileModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Also delete system role
    await this.employeeSystemRoleModel.deleteOne({ employeeProfileId: id });

    return { message: 'Employee deleted successfully' };
  }

  async getTeam(managerId: string, skip = 0, limit = 10): Promise<{
    data: EmployeeProfileResponseDto[];
    total: number;
  }> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID');
    }

    // Find employees reporting to this manager
    const filter = {
      supervisorPositionId: { $exists: true },
    };

    const total = await this.employeeProfileModel.countDocuments(filter);
    const employees = await this.employeeProfileModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    return {
      data: employees.map(emp => this.mapToResponseDto(emp)),
      total,
    };
  }

  async updateStatus(id: string, status: EmployeeStatus): Promise<EmployeeProfileResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const updatedEmployee = await this.employeeProfileModel
      .findByIdAndUpdate(
        id,
        {
          status,
          statusEffectiveFrom: new Date(),
        },
        { new: true },
      )
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    if (!updatedEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedEmployee);
  }

  // ============ DIRECT CONTACT INFO UPDATE (BR 2n, 2o, 2g) ============

  async updateContactInfo(id: string, updateDto: any): Promise<EmployeeProfileResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const updateData: any = {};

    // Only allow contact-related fields to be updated directly
    if (updateDto.mobilePhone !== undefined) {
      updateData.mobilePhone = updateDto.mobilePhone;
    }
    if (updateDto.homePhone !== undefined) {
      updateData.homePhone = updateDto.homePhone;
    }
    if (updateDto.personalEmail !== undefined) {
      updateData.personalEmail = updateDto.personalEmail;
    }
    if (updateDto.address !== undefined) {
      updateData.address = updateDto.address;
    }

    const updatedEmployee = await this.employeeProfileModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .exec();

    if (!updatedEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Log the change for audit purposes
    console.log(`[CONTACT INFO UPDATE] Employee ${id} updated contact info at ${new Date().toISOString()}`);

    return this.mapToResponseDto(updatedEmployee);
  }

  // ============ PROFILE PICTURE UPLOAD (US-E2-12) ============

  async uploadProfilePicture(id: string, file: Express.Multer.File): Promise<EmployeeProfileResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const employee = await this.employeeProfileModel.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Delete old profile picture if exists
    if (employee.profilePictureUrl) {
      const fs = require('fs');
      const path = require('path');
      const oldPicturePath = path.join(process.cwd(), employee.profilePictureUrl);

      if (fs.existsSync(oldPicturePath)) {
        try {
          fs.unlinkSync(oldPicturePath);
          console.log(`[UPLOAD PICTURE] Deleted old picture: ${oldPicturePath}`);
        } catch (error) {
          console.error(`[UPLOAD PICTURE] Error deleting old picture: ${error.message}`);
        }
      }
    }

    // Update employee with new picture URL
    const pictureUrl = `/uploads/profile-pictures/${file.filename}`;
    employee.profilePictureUrl = pictureUrl;
    await employee.save();

    console.log(`[UPLOAD PICTURE] Employee ${id} uploaded new profile picture: ${pictureUrl}`);

    return this.mapToResponseDto(employee);
  }

  // ============ NEW METHODS FOR QUALIFICATIONS ============

  async addQualification(employeeId: string, createDto: CreateQualificationDto) {
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const qualification = new this.employeeQualificationModel({
      employeeProfileId: employeeId,
      ...createDto,
    });

    return await qualification.save();
  }

  async getQualifications(employeeId: string) {
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return await this.employeeQualificationModel.find({ employeeProfileId: employeeId }).exec();
  }

  // ============ NEW METHODS FOR ROLES ============

  async assignRoles(employeeId: string, assignDto: AssignRoleDto) {
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let role = await this.employeeSystemRoleModel.findOne({ employeeProfileId: employeeId });

    if (role) {
      role.roles = assignDto.roles;
      role.permissions = assignDto.permissions || role.permissions;
    } else {
      role = new this.employeeSystemRoleModel({
        employeeProfileId: employeeId,
        roles: assignDto.roles,
        permissions: assignDto.permissions || [],
      });
    }

    const saved = await role.save();
    employee.accessProfileId = saved._id;
    await employee.save();

    return saved;
  }

  async getEmployeeRoles(employeeId: string) {
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let role = await this.employeeSystemRoleModel.findOne({ employeeProfileId: employeeId });

    if (!role) {
      role = new this.employeeSystemRoleModel({
        employeeProfileId: employeeId,
        roles: [SystemRole.DEPARTMENT_EMPLOYEE],
        permissions: [],
      });
      await role.save();
    }

    return role;
  }

  async getAllRoles() {
    const roles = await this.employeeSystemRoleModel
      .find()
      .populate('employeeProfileId', 'fullName employeeNumber workEmail')
      .exec();

    // Transform to flatten the data for frontend
    const flattenedRoles: any[] = [];
    for (const roleDoc of roles) {
      const employeeProfile = roleDoc.employeeProfileId as any;
      // Each role document has a roles array, we need to create an entry for each role
      if (roleDoc.roles && roleDoc.roles.length > 0) {
        for (const role of roleDoc.roles) {
          flattenedRoles.push({
            _id: `${roleDoc._id}-${role}`,
            employeeProfile: {
              fullName: employeeProfile?.fullName || 'Unknown',
              employeeNumber: employeeProfile?.employeeNumber || 'N/A',
              workEmail: employeeProfile?.workEmail || 'N/A',
            },
            systemRole: role,
            assignedAt: (roleDoc as any).createdAt || new Date(),
          });
        }
      }
    }

    return flattenedRoles;
  }


  async updateRoles(employeeId: string, updateDto: UpdateRoleDto) {
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let role = await this.employeeSystemRoleModel.findOne({ employeeProfileId: employeeId });

    if (!role) {
      role = new this.employeeSystemRoleModel({
        employeeProfileId: employeeId,
      });
    }

    if (updateDto.roles) {
      role.roles = updateDto.roles;
    }
    if (updateDto.permissions) {
      role.permissions = updateDto.permissions;
    }

    return await role.save();
  }

  async deactivateRoles(employeeId: string) {
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let role = await this.employeeSystemRoleModel.findOne({ employeeProfileId: employeeId });

    if (!role) {
      throw new NotFoundException('Employee role not found');
    }

    role.isActive = false;
    return await role.save();
  }

  // ============ NEW METHODS FOR CANDIDATES ============

  async createCandidate(createDto: CreateCandidateDto) {
    const existing = await this.candidateModel.findOne({
      $or: [{ personalEmail: createDto.personalEmail }, { nationalId: createDto.nationalId }],
    });

    if (existing) {
      throw new ConflictException('Candidate with this email or national ID already exists');
    }

    // Generate unique candidate number
    const candidateCount = await this.candidateModel.countDocuments();
    const candidateNumber = `CAND-${String(candidateCount + 1).padStart(5, '0')}`;

    const candidate = new this.candidateModel({
      ...createDto,
      candidateNumber,
      status: createDto.status || CandidateStatus.APPLIED,
      fullName: `${createDto.firstName} ${createDto.lastName}`,
    });

    return await candidate.save();
  }

  async getAllCandidates(queryDto: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { appliedPosition: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.candidateModel.find(filter).skip(skip).limit(Number(limit)).exec(),
      this.candidateModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getCandidateById(id: string) {
    const candidate = await this.candidateModel.findById(id).exec();
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  async updateCandidateStatus(candidateId: string, updateDto: UpdateCandidateStatusDto) {
    const candidate = await this.candidateModel.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    candidate.status = updateDto.status;
    return await candidate.save();
  }

  async convertCandidateToEmployee(candidateId: string, convertDto: ConvertCandidateToEmployeeDto) {
    const candidate = await this.candidateModel.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.status !== CandidateStatus.OFFER_ACCEPTED) {
      throw new BadRequestException('Only candidates with OFFER_ACCEPTED status can be converted');
    }

    const existing = await this.employeeProfileModel.findOne({
      $or: [{ employeeNumber: convertDto.employeeNumber }, { nationalId: candidate.nationalId }],
    });

    if (existing) {
      throw new ConflictException('Employee with this number or national ID already exists');
    }

    const hashedPassword = await bcrypt.hash(convertDto.password, 10);

    const employee = new this.employeeProfileModel({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      middleName: candidate.middleName,
      nationalId: candidate.nationalId,
      dateOfBirth: candidate.dateOfBirth,
      personalEmail: candidate.personalEmail,
      workEmail: convertDto.workEmail,
      password: hashedPassword,
      isTemporaryPassword: true,
      employeeNumber: convertDto.employeeNumber,
      dateOfHire: new Date(),
      status: EmployeeStatus.ACTIVE,
      primaryPositionId: this.isValidObjectId(convertDto.primaryPositionId)
        ? new Types.ObjectId(convertDto.primaryPositionId)
        : undefined,
      primaryDepartmentId: this.isValidObjectId(convertDto.primaryDepartmentId)
        ? new Types.ObjectId(convertDto.primaryDepartmentId)
        : undefined,
      payGradeId: this.isValidObjectId(convertDto.payGradeId)
        ? new Types.ObjectId(convertDto.payGradeId)
        : undefined,
      fullName: `${candidate.firstName} ${candidate.lastName}`,
    });

    const savedEmployee = await employee.save();
    await this.candidateModel.findByIdAndDelete(candidateId);

    return this.mapToResponseDto(savedEmployee);
  }

  // ============ NEW METHODS FOR CHANGE REQUESTS ============

  async createChangeRequest(employeeId: string, createDto: CreateChangeRequestDto) {
    try {
      const employee = await this.employeeProfileModel.findById(employeeId);
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const changeRequest = new this.changeRequestModel({
        requestId,
        employeeProfileId: employeeId,
        ...createDto,
        status: ProfileChangeStatus.PENDING,
        submittedAt: new Date(),
      });

      const saved = await changeRequest.save();
      console.log(`[CREATE CHANGE REQUEST] Successfully created request ${requestId} for employee ${employeeId}`);
      return saved;
    } catch (error) {
      console.error('[CREATE CHANGE REQUEST] Error:', error.message);
      throw new BadRequestException(`Failed to create change request: ${error.message}`);
    }
  }

  async getAllChangeRequests(queryDto: PaginationQueryDto) {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const skip = (page - 1) * limit;

      const filter: any = {};

      const [data, total] = await Promise.all([
        this.changeRequestModel
          .find(filter)
          .populate('employeeProfileId', 'fullName employeeNumber workEmail')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.changeRequestModel.countDocuments(filter),
      ]);

      console.log(`[GET CHANGE REQUESTS] Found ${total} total requests, returning page ${page}`);

      return {
        data,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('[GET CHANGE REQUESTS] Error:', error.message);
      throw new BadRequestException(`Failed to fetch change requests: ${error.message}`);
    }
  }

  async approveChangeRequest(requestId: string) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new BadRequestException('Invalid change request ID format');
      }

      const request = await this.changeRequestModel.findByIdAndUpdate(
        requestId,
        {
          status: ProfileChangeStatus.APPROVED,
          processedAt: new Date(),
        },
        { new: true }
      ).populate('employeeProfileId', 'fullName employeeNumber workEmail').exec();

      if (!request) {
        throw new NotFoundException(`Change request with ID ${requestId} not found`);
      }

      // Create notification for the employee
      const employeeId = typeof request.employeeProfileId === 'string'
        ? request.employeeProfileId
        : request.employeeProfileId._id;

      await this.notificationService.notifyRequestApproved(
        employeeId.toString(),
        request._id.toString(),
        'change request'
      );

      console.log(`[APPROVE CHANGE REQUEST] Approved request ${requestId} and sent notification`);
      return request;
    } catch (error) {
      console.error('[APPROVE CHANGE REQUEST] Error:', error.message);
      throw new BadRequestException(`Failed to approve change request: ${error.message} `);
    }
  }

  async rejectChangeRequest(requestId: string) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new BadRequestException('Invalid change request ID format');
      }

      const request = await this.changeRequestModel.findByIdAndUpdate(
        requestId,
        {
          status: ProfileChangeStatus.REJECTED,
          processedAt: new Date(),
        },
        { new: true }
      ).populate('employeeProfileId', 'fullName employeeNumber workEmail').exec();

      if (!request) {
        throw new NotFoundException(`Change request with ID ${requestId} not found`);
      }

      // Create notification for the employee
      const employeeId = typeof request.employeeProfileId === 'string'
        ? request.employeeProfileId
        : request.employeeProfileId._id;

      await this.notificationService.notifyRequestRejected(
        employeeId.toString(),
        request._id.toString(),
        'change request'
      );

      console.log(`[REJECT CHANGE REQUEST] Rejected request ${requestId} and sent notification`);
      return request;
    } catch (error) {
      console.error('[REJECT CHANGE REQUEST] Error:', error.message);
      throw new BadRequestException(`Failed to reject change request: ${error.message} `);
    }
  }

  async getChangeRequestById(requestId: string) {
    const changeRequest = await this.changeRequestModel.findById(requestId);
    if (!changeRequest) {
      throw new NotFoundException('Change request not found');
    }

    return changeRequest;
  }

  // ============ DEACTIVATION AND EXPORT METHODS ============

  async deactivateEmployee(id: string, status: EmployeeStatus) {
    if (![EmployeeStatus.SUSPENDED, EmployeeStatus.TERMINATED, EmployeeStatus.RETIRED].includes(status)) {
      throw new BadRequestException('Invalid deactivation status');
    }

    const employee = await this.employeeProfileModel.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    employee.status = status;
    employee.statusEffectiveFrom = new Date();

    const updated = await employee.save();
    return this.mapToResponseDto(updated);
  }

  async createEmployeeProfile(createDto: CreateEmployeeProfileDto) {
    const existing = await this.employeeProfileModel.findOne({
      $or: [{ employeeNumber: createDto.employeeNumber }, { nationalId: createDto.nationalId }],
    });

    if (existing) {
      throw new ConflictException('Employee with this number or national ID already exists');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const employee = new this.employeeProfileModel({
      ...createDto,
      password: hashedPassword,
      status: EmployeeStatus.ACTIVE,
      fullName: `${createDto.firstName} ${createDto.lastName} `,
      primaryPositionId: this.isValidObjectId(createDto.primaryPositionId)
        ? new Types.ObjectId(createDto.primaryPositionId)
        : undefined,
      primaryDepartmentId: this.isValidObjectId(createDto.primaryDepartmentId)
        ? new Types.ObjectId(createDto.primaryDepartmentId)
        : undefined,
      payGradeId: this.isValidObjectId(createDto.payGradeId)
        ? new Types.ObjectId(createDto.payGradeId)
        : undefined,
    });

    const saved = await employee.save();
    return this.mapToResponseDto(saved);
  }

  async getAllEmployees(queryDto: PaginationQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (queryDto.search) {
      filter.$or = [
        { firstName: { $regex: queryDto.search, $options: 'i' } },
        { lastName: { $regex: queryDto.search, $options: 'i' } },
        { employeeNumber: { $regex: queryDto.search, $options: 'i' } },
        { workEmail: { $regex: queryDto.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.employeeProfileModel.find(filter).skip(skip).limit(limit).exec(),
      this.employeeProfileModel.countDocuments(filter),
    ]);

    return {
      data: data.map((emp) => this.mapToResponseDto(emp)),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getEmployeeById(id: string) {
    const employee = await this.employeeProfileModel
      .findById(id)
      .populate(['primaryPositionId', 'primaryDepartmentId', 'payGradeId'])
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.mapToResponseDto(employee);
  }

  async updateEmployeeProfile(id: string, updateDto: UpdateEmployeeProfileDto) {
    const employee = await this.employeeProfileModel.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (updateDto.firstName || updateDto.lastName) {
      const firstName = updateDto.firstName || employee.firstName;
      const lastName = updateDto.lastName || employee.lastName;
      employee.fullName = `${firstName} ${lastName} `;
    }

    // Only update fields that are actually provided in updateDto
    // This prevents undefined status from triggering validation errors
    Object.keys(updateDto).forEach((key) => {
      if (updateDto[key] !== undefined) {
        employee[key] = updateDto[key];
      }
    });

    const updated = await employee.save();

    return this.mapToResponseDto(updated);
  }

  async exportEmployeeProfileToPdf(id: string): Promise<Buffer> {
    const employee = await this.employeeProfileModel
      .findById(id)
      .populate(['primaryPositionId', 'primaryDepartmentId', 'payGradeId'])
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Import PDFKit dynamically
    const PDFDocument = require('pdfkit');

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('Employee Profile Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()} `, { align: 'center' });
        doc.moveDown(2);

        // Personal Information Section
        doc.fontSize(16).font('Helvetica-Bold').text('Personal Information');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        const personalInfo = [
          { label: 'Full Name', value: employee.fullName },
          { label: 'Employee Number', value: employee.employeeNumber },
          { label: 'National ID', value: employee.nationalId },
          { label: 'Date of Birth', value: employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A' },
          { label: 'Gender', value: employee.gender || 'N/A' },
          { label: 'Marital Status', value: employee.maritalStatus || 'N/A' },
        ];

        personalInfo.forEach(item => {
          doc.font('Helvetica-Bold').text(`${item.label}: `, { continued: true })
            .font('Helvetica').text(item.value);
        });

        doc.moveDown(1.5);

        // Contact Information Section
        doc.fontSize(16).font('Helvetica-Bold').text('Contact Information');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        const contactInfo = [
          { label: 'Work Email', value: employee.workEmail || 'N/A' },
          { label: 'Personal Email', value: employee.personalEmail || 'N/A' },
          { label: 'Mobile Phone', value: employee.mobilePhone || 'N/A' },
          { label: 'Home Phone', value: employee.homePhone || 'N/A' },
        ];

        contactInfo.forEach(item => {
          doc.font('Helvetica-Bold').text(`${item.label}: `, { continued: true })
            .font('Helvetica').text(item.value);
        });

        doc.moveDown(1.5);

        // Employment Information Section
        doc.fontSize(16).font('Helvetica-Bold').text('Employment Information');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        const employmentInfo = [
          { label: 'Status', value: employee.status },
          { label: 'Date of Hire', value: employee.dateOfHire ? new Date(employee.dateOfHire).toLocaleDateString() : 'N/A' },
          { label: 'Contract Type', value: employee.contractType || 'N/A' },
          { label: 'Work Type', value: employee.workType || 'N/A' },
          { label: 'Contract Start Date', value: employee.contractStartDate ? new Date(employee.contractStartDate).toLocaleDateString() : 'N/A' },
          { label: 'Contract End Date', value: employee.contractEndDate ? new Date(employee.contractEndDate).toLocaleDateString() : 'N/A' },
        ];

        employmentInfo.forEach(item => {
          doc.font('Helvetica-Bold').text(`${item.label}: `, { continued: true })
            .font('Helvetica').text(item.value);
        });

        doc.moveDown(1.5);

        // Banking Information Section
        doc.fontSize(16).font('Helvetica-Bold').text('Banking Information');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        const bankingInfo = [
          { label: 'Bank Name', value: employee.bankName || 'N/A' },
          { label: 'Account Number', value: employee.bankAccountNumber || 'N/A' },
        ];

        bankingInfo.forEach(item => {
          doc.font('Helvetica-Bold').text(`${item.label}: `, { continued: true })
            .font('Helvetica').text(item.value);
        });

        // Biography Section (if available)
        if (employee.biography) {
          doc.moveDown(1.5);
          doc.fontSize(16).font('Helvetica-Bold').text('Biography');
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica').text(employee.biography, { align: 'justify' });
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica').text(
          'This document is confidential and intended for internal use only.',
          { align: 'center', color: 'gray' }
        );

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async exportEmployeesToCsv(): Promise<string> {
    const { Parser } = require('json2csv');

    // Fetch all active employees with populated fields
    const employees = await this.employeeProfileModel
      .find({ status: 'ACTIVE' })
      .populate(['primaryPositionId', 'primaryDepartmentId', 'payGradeId'])
      .lean()
      .exec();

    // Define CSV fields
    const fields = [
      { label: 'Employee Number', value: 'employeeNumber' },
      { label: 'Full Name', value: 'fullName' },
      { label: 'First Name', value: 'firstName' },
      { label: 'Last Name', value: 'lastName' },
      { label: 'National ID', value: 'nationalId' },
      { label: 'Work Email', value: 'workEmail' },
      { label: 'Personal Email', value: 'personalEmail' },
      { label: 'Mobile Phone', value: 'mobilePhone' },
      { label: 'Home Phone', value: 'homePhone' },
      { label: 'Date of Birth', value: 'dateOfBirth' },
      { label: 'Date of Hire', value: 'dateOfHire' },
      { label: 'Gender', value: 'gender' },
      { label: 'Marital Status', value: 'maritalStatus' },
      { label: 'Status', value: 'status' },
      { label: 'Contract Type', value: 'contractType' },
      { label: 'Work Type', value: 'workType' },
      { label: 'Contract Start Date', value: 'contractStartDate' },
      { label: 'Contract End Date', value: 'contractEndDate' },
      { label: 'Department', value: (row) => row.primaryDepartmentId?.name || 'N/A' },
      { label: 'Position', value: (row) => row.primaryPositionId?.title || 'N/A' },
      { label: 'Pay Grade', value: (row) => row.payGradeId?.title || 'N/A' },
      { label: 'Bank Name', value: 'bankName' },
      { label: 'Bank Account Number', value: 'bankAccountNumber' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(employees);

    return csv;
  }

  private mapToResponseDto(employee: EmployeeProfileDocument): EmployeeProfileResponseDto {
    return {
      _id: employee._id.toString(),
      workEmail: employee.workEmail || '',
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      fullName: employee.fullName || `${employee.firstName} ${employee.lastName} `,
      employeeNumber: employee.employeeNumber,
      nationalId: employee.nationalId,
      dateOfBirth: employee.dateOfBirth,
      dateOfHire: employee.dateOfHire,
      gender: employee.gender,
      maritalStatus: employee.maritalStatus,
      mobilePhone: employee.mobilePhone,
      homePhone: employee.homePhone,
      personalEmail: employee.personalEmail,
      status: employee.status,
      contractType: employee.contractType,
      workType: employee.workType,
      contractStartDate: employee.contractStartDate,
      contractEndDate: employee.contractEndDate,
      bankName: employee.bankName,
      bankAccountNumber: employee.bankAccountNumber,
      biography: employee.biography,
      profilePictureUrl: employee.profilePictureUrl,
    };
  }
}

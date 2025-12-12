import { Injectable, UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { Gender } from '../employee-profile/enums/employee-profile.enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  private roleMapping: { [key: string]: string } = {
    'system_admin': 'System Admin',
    'hr_manager': 'HR Manager',
    'hr_employee': 'HR Employee',
    'hr_admin': 'HR Admin',
    'payroll_manager': 'Payroll Manager',
    'payroll_specialist': 'Payroll Specialist',
    'finance_staff': 'Finance Staff',
    'legal_admin': 'Legal & Policy Admin',
    'department_manager': 'Department Head',
    'line_manager': 'Department Employee', // Assuming Line Manager falls under Department Employee or Head logic, mapping to Dept Employee for default
    'employee': 'Department Employee',
  };

  constructor(
    private jwtService: JwtService,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
  ) { }

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const queryConditions: any[] = [{ workEmail: registerDto.email }];
    if (registerDto.employeeId) {
      queryConditions.push({ employeeNumber: registerDto.employeeId });
    }

    const existingEmployees = await this.employeeProfileModel.find({ $or: queryConditions });

    if (existingEmployees.length > 0) {
      // Check if any is a "real" user (has a role assigned)
      const hasRealUser = existingEmployees.some(e => e.accessProfileId);

      if (hasRealUser) {
        throw new ConflictException('User with this email or Employee ID already exists');
      }

      // If all matches are "zombies" (failed registrations with no role), clean them up
      // This is "self-healing" for failed transactions
      await this.employeeProfileModel.deleteMany({
        _id: { $in: existingEmployees.map(e => e._id) }
      });
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create basic profile
    const newEmployee = new this.employeeProfileModel({
      workEmail: registerDto.email,
      password: hashedPassword,
      firstName: 'New',
      lastName: 'User',
      fullName: 'New User',
      status: 'ACTIVE',
      statusEffectiveFrom: new Date(),
      employeeNumber: registerDto.employeeId || `EMP-${Date.now()}`,
      // Default fields
      personalEmail: registerDto.email,
      gender: Gender.MALE, // Default placeholder as required by schema
      dateOfHire: new Date(),
      nationalId: `TEMP-ID-${Date.now()}`, // Temporary ID as required by schema
      maritalStatus: 'SINGLE',
    });

    const savedEmployee = await newEmployee.save();

    // Map role
    const systemRoleValue = this.roleMapping[registerDto.role] || 'Department Employee';

    try {
      // Create role
      const systemRole = new this.employeeSystemRoleModel({
        employeeProfileId: savedEmployee._id,
        roles: [systemRoleValue],
        permissions: [], // Default permissions based on role could be added here
        isActive: true,
      });

      await systemRole.save();

      // Update employee with access profile
      savedEmployee.accessProfileId = systemRole._id;
      await savedEmployee.save();
    } catch (error) {
      // Rollback: delete the created employee entry if role creation fails
      await this.employeeProfileModel.findByIdAndDelete(savedEmployee._id);
      throw new InternalServerErrorException('Registration failed - rolled back. Please try again.');
    }

    // Generate token
    const payload = {
      sub: savedEmployee._id.toString(),
      email: savedEmployee.workEmail,
      role: registerDto.role,
      fullName: savedEmployee.fullName,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
      expiresIn: '24h',
    });

    return {
      accessToken,
      email: savedEmployee.workEmail || '',
      userId: savedEmployee._id.toString(),
      fullName: savedEmployee.fullName || '',
      role: systemRoleValue,
      isTemporaryPassword: false,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const employee = await this.employeeProfileModel
      .findOne({ workEmail: loginDto.email })
      .populate('accessProfileId')
      .exec();

    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = employee.password
      ? await bcrypt.compare(loginDto.password, employee.password)
      : false;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get role information
    const accessProfile = employee.accessProfileId as any;
    const roleName = accessProfile?.roles?.[0] || 'DEPARTMENT_EMPLOYEE';

    // Create JWT payload
    const payload = {
      sub: employee._id.toString(),
      email: employee.workEmail || loginDto.email,
      role: roleName,
      fullName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
      expiresIn: '24h',
    });

    return {
      accessToken,
      email: employee.workEmail || loginDto.email,
      userId: employee._id.toString(),
      fullName: payload.fullName,
      role: roleName,
      isTemporaryPassword: employee.isTemporaryPassword || false,
    };
  }

  async validateUser(userId: string, email: string): Promise<any> {
    const user = await this.employeeProfileModel
      .findById(userId)
      .populate('accessProfileId')
      .exec();

    if (user && user.workEmail === email) {
      return user;
    }

    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await this.employeeProfileModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      isTemporaryPassword: false,
    }).exec();
  }
}

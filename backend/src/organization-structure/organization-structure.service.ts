import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './models/department.schema';
import { Position, PositionDocument } from './models/position.schema';
import { PositionAssignment, PositionAssignmentDocument } from './models/position-assignment.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AssignPositionDto } from './dto/assign-position.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/models/notification.schema';
import { StructureRequestStatus } from './enums/organization-structure.enums';

@Injectable()
export class OrganizationStructureService {
    constructor(
        @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
        @InjectModel(PositionAssignment.name) private positionAssignmentModel: Model<PositionAssignmentDocument>,
        @InjectModel('EmployeeProfile') private employeeProfileModel: Model<EmployeeProfileDocument>,
        @InjectModel('StructureChangeRequest') private structureChangeRequestModel: Model<any>,
        private notificationService: NotificationService,
    ) { }

    // --- Change Requests ---

    async createChangeRequest(createChangeRequestDto: any): Promise<any> {
        try {
            // Generate unique request number
            const count = await this.structureChangeRequestModel.countDocuments().exec();
            const requestNumber = `SCR-${String(count + 1).padStart(6, '0')}`;

            // Validate employee exists
            const employee = await this.employeeProfileModel.findById(createChangeRequestDto.requestedByEmployeeId).exec();
            if (!employee) {
                throw new NotFoundException(`Employee with ID ${createChangeRequestDto.requestedByEmployeeId} not found`);
            }

            // Create the request with proper data transformation
            const requestData = {
                requestNumber,
                requestedByEmployeeId: new Types.ObjectId(createChangeRequestDto.requestedByEmployeeId),
                requestType: createChangeRequestDto.requestType,
                targetDepartmentId: createChangeRequestDto.targetDepartmentId
                    ? new Types.ObjectId(createChangeRequestDto.targetDepartmentId)
                    : undefined,
                targetPositionId: createChangeRequestDto.targetPositionId
                    ? new Types.ObjectId(createChangeRequestDto.targetPositionId)
                    : undefined,
                details: createChangeRequestDto.details,
                reason: createChangeRequestDto.reason,
                status: StructureRequestStatus.SUBMITTED,
                submittedByEmployeeId: new Types.ObjectId(createChangeRequestDto.requestedByEmployeeId),
                submittedAt: new Date(),
            };

            const createdRequest = new this.structureChangeRequestModel(requestData);
            const saved = await createdRequest.save();

            console.log(`[CREATE CHANGE REQUEST] Successfully created request ${requestNumber}`);

            // Notify Requester
            await this.notificationService.createNotification({
                recipientId: createChangeRequestDto.requestedByEmployeeId,
                type: NotificationType.STRUCTURE_REQUEST,
                title: 'Change Request Submitted',
                message: `Your change request ${requestNumber} has been submitted successfully.`,
                relatedEntityId: saved._id.toString(),
                relatedEntityType: 'StructureChangeRequest',
            });

            return saved;
        } catch (error) {
            console.error('[CREATE CHANGE REQUEST] Error:', error.message);
            throw new BadRequestException(`Failed to create change request: ${error.message}`);
        }
    }

    async findAllChangeRequests(page: number = 1, limit: number = 10, status?: string): Promise<{ data: any[], total: number, page: number, limit: number, totalPages: number }> {
        // Build filter
        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        // Count total documents matching filter
        const total = await this.structureChangeRequestModel.countDocuments(filter).exec();

        // Calculate pagination
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);

        // Fetch paginated results with employee population
        const data = await this.structureChangeRequestModel
            .find(filter)
            .populate('requestedByEmployeeId', 'fullName employeeNumber')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        return {
            data,
            total,
            page,
            limit,
            totalPages
        };
    }

    async findOneChangeRequest(id: string): Promise<any> {
        const changeRequest = await this.structureChangeRequestModel
            .findById(id)
            .populate('requestedByEmployeeId', 'fullName employeeNumber')
            .exec();

        if (!changeRequest) {
            throw new NotFoundException(`Change Request with ID ${id} not found`);
        }

        return changeRequest;
    }

    async approveChangeRequest(id: string): Promise<any> {
        try {
            const updated = await this.structureChangeRequestModel.findByIdAndUpdate(
                id,
                { status: 'APPROVED', approvedAt: new Date() },
                { new: true, runValidators: true }
            ).exec();

            if (!updated) {
                throw new NotFoundException(`Change Request with ID ${id} not found`);
            }
            console.log(`[APPROVE] Successfully updated request ${id} to APPROVED`);

            // Notify Requester
            if (updated.requestedByEmployeeId) {
                await this.notificationService.createNotification({
                    recipientId: updated.requestedByEmployeeId.toString(),
                    type: NotificationType.REQUEST_APPROVED,
                    title: 'Structure Change Request Approved',
                    message: `Your change request ${updated.requestNumber} has been APPROVED.`,
                    relatedEntityId: updated._id.toString(),
                    relatedEntityType: 'StructureChangeRequest',
                });
            }

            return updated;
        } catch (error) {
            console.error(`[APPROVE] Error approving request ${id}:`, error.message);
            throw new BadRequestException(`Failed to approve request: ${error.message}`);
        }
    }

    async rejectChangeRequest(id: string): Promise<any> {
        try {
            const updated = await this.structureChangeRequestModel.findByIdAndUpdate(
                id,
                { status: 'REJECTED', rejectedAt: new Date() },
                { new: true, runValidators: true }
            ).exec();

            if (!updated) {
                throw new NotFoundException(`Change Request with ID ${id} not found`);
            }
            console.log(`[REJECT] Successfully updated request ${id} to REJECTED`);

            // Notify Requester
            if (updated.requestedByEmployeeId) {
                await this.notificationService.createNotification({
                    recipientId: updated.requestedByEmployeeId.toString(),
                    type: NotificationType.REQUEST_REJECTED,
                    title: 'Structure Change Request Rejected',
                    message: `Your change request ${updated.requestNumber} has been REJECTED.`,
                    relatedEntityId: updated._id.toString(),
                    relatedEntityType: 'StructureChangeRequest',
                });
            }

            return updated;
        } catch (error) {
            console.error(`[REJECT] Error rejecting request ${id}:`, error.message);
            throw new BadRequestException(`Failed to reject request: ${error.message}`);
        }
    }

    async getMyTeam(managerId: string): Promise<any[]> {
        // 1. Find manager's current position assignment
        const myAssignment = await this.positionAssignmentModel.findOne({
            employeeProfileId: new Types.ObjectId(managerId),
            $or: [{ endDate: null }, { endDate: { $gt: new Date() } }]
        }).exec();

        if (!myAssignment) {
            console.log(`[MyTeam] No assignment found for manager ${managerId}`);
            return []; // Not assigned to any position, so no team
        }
        console.log(`[MyTeam] Found assignment for manager ${managerId}: ${myAssignment.positionId}`);

        // 2. Find all positions that report to this position
        const directReportPositions = await this.positionModel.find({
            reportsToPositionId: myAssignment.positionId
        }).exec();

        if (directReportPositions.length === 0) {
            console.log(`[MyTeam] No direct reports found for position ${myAssignment.positionId}`);
            return [];
        }
        console.log(`[MyTeam] Found ${directReportPositions.length} direct report positions.`);

        const positionIds = directReportPositions.map(p => p._id);

        // 3. Find employees assigned to these positions
        const teamAssignments = await this.positionAssignmentModel.find({
            positionId: { $in: positionIds },
            $or: [{ endDate: null }, { endDate: { $gt: new Date() } }]
        })
            .populate('employeeProfileId', 'firstName lastName workEmail jobTitle departmentId')
            .populate('positionId', 'title code')
            .populate('departmentId', 'name')
            .exec();

        // 4. Transform to friendly format
        return teamAssignments.map(assignment => {
            const emp = assignment.employeeProfileId as any;
            const pos = assignment.positionId as any;
            const dept = assignment.departmentId as any;
            return {
                id: emp._id,
                name: `${emp.firstName} ${emp.lastName}`,
                email: emp.workEmail,
                position: pos.title,
                department: dept.name,
                assignmentDate: assignment.startDate,
            };
        });
    }

    // --- Department ---

    async createDepartment(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
        const createdDepartment = new this.departmentModel(createDepartmentDto);
        return createdDepartment.save();
    }

    async findAllDepartments(): Promise<Department[]> {
        return this.departmentModel.find().exec();
    }

    async findOneDepartment(id: string): Promise<Department> {
        const department = await this.departmentModel.findById(id).exec();
        if (!department) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }

    async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
        const updatedDepartment = await this.departmentModel
            .findByIdAndUpdate(id, updateDepartmentDto, { new: true })
            .exec();
        if (!updatedDepartment) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return updatedDepartment;
    }

    async removeDepartment(id: string): Promise<Department> {
        // Check if department has any positions (historical data protection - BR 12, BR 37)
        const positionsInDept = await this.positionModel.countDocuments({ departmentId: id }).exec();
        if (positionsInDept > 0) {
            throw new BadRequestException(
                `Cannot delete department with existing positions (${positionsInDept} found). Use deactivate instead to preserve audit trail. (BR 12, BR 37)`
            );
        }

        const deletedDepartment = await this.departmentModel.findByIdAndDelete(id).exec();
        if (!deletedDepartment) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return deletedDepartment;
    }

    async activateDepartment(id: string): Promise<Department> {
        const department = await this.departmentModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
        if (!department) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }

    async deactivateDepartment(id: string): Promise<Department> {
        const department = await this.departmentModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!department) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }

    async findPositionsByDepartment(departmentId: string): Promise<Position[]> {
        return this.positionModel.find({ departmentId }).exec();
    }

    async getDepartmentHierarchy(departmentId: string): Promise<any> {
        const department = await this.departmentModel.findById(departmentId).lean().exec();
        if (!department) {
            throw new NotFoundException(`Department with ID ${departmentId} not found`);
        }
        // Simple hierarchy: Department -> Positions
        const positions = await this.positionModel.find({ departmentId }).lean().exec();
        return { ...department, positions };
    }

    async getFullHierarchy(): Promise<any[]> {
        const departments = await this.departmentModel.find().lean().exec();
        const hierarchy: any[] = [];
        for (const dept of departments) {
            const positions = await this.positionModel.find({ departmentId: dept._id }).lean().exec();
            hierarchy.push({ ...dept, positions });
        }
        return hierarchy;
    }

    // --- Position ---

    async createPosition(createPositionDto: CreatePositionDto): Promise<Position> {
        // Validate Department exists
        const department = await this.departmentModel.findById(createPositionDto.departmentId).exec();
        if (!department) {
            throw new NotFoundException(`Department with ID ${createPositionDto.departmentId} not found`);
        }

        const createdPosition = new this.positionModel(createPositionDto);
        return createdPosition.save();
    }

    async findAllPositions(): Promise<Position[]> {
        return this.positionModel.find().populate('departmentId').exec();
    }

    async findOnePosition(id: string): Promise<Position> {
        const position = await this.positionModel.findById(id).populate('departmentId').exec();
        if (!position) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
        return position;
    }

    async updatePosition(id: string, updatePositionDto: UpdatePositionDto): Promise<Position> {
        const updatedPosition = await this.positionModel
            .findByIdAndUpdate(id, updatePositionDto, { new: true })
            .exec();
        if (!updatedPosition) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
        return updatedPosition;
    }

    async removePosition(id: string): Promise<Position> {
        // Check if position has any assignments (historical data protection - BR 12, BR 37)
        const assignments = await this.positionAssignmentModel.countDocuments({ positionId: id }).exec();
        if (assignments > 0) {
            throw new BadRequestException(
                `Cannot delete position with employee assignments (${assignments} found). Use deactivate instead to preserve audit trail. (BR 12, BR 37)`
            );
        }

        const deletedPosition = await this.positionModel.findByIdAndDelete(id).exec();
        if (!deletedPosition) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
        return deletedPosition;
    }

    async activatePosition(id: string): Promise<Position> {
        const position = await this.positionModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
        if (!position) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
        return position;
    }

    async deactivatePosition(id: string): Promise<Position> {
        const position = await this.positionModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!position) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
        return position;
    }

    // --- Assignment ---

    async assignPosition(assignPositionDto: AssignPositionDto): Promise<PositionAssignment> {
        const { employeeProfileId, positionId, startDate, reason, notes } = assignPositionDto;

        // 1. Validate Employee
        const employee = await this.employeeProfileModel.findById(employeeProfileId).exec();
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${employeeProfileId} not found`);
        }

        // 2. Validate Position
        const position = await this.positionModel.findById(positionId).exec();
        if (!position) {
            throw new NotFoundException(`Position with ID ${positionId} not found`);
        }

        // 3. Create Assignment
        const assignment = new this.positionAssignmentModel({
            employeeProfileId: new Types.ObjectId(employeeProfileId),
            positionId: new Types.ObjectId(positionId),
            departmentId: position.departmentId, // Snapshot of current department
            startDate: new Date(startDate),
            reason,
            notes,
        });
        const savedAssignment = await assignment.save();

        // 4. Update Employee Profile
        employee.primaryPositionId = new Types.ObjectId(positionId);
        employee.primaryDepartmentId = position.departmentId;
        // Also update supervisor if position has reportsTo
        if (position.reportsToPositionId) {
            employee.supervisorPositionId = position.reportsToPositionId;
        }

        await employee.save();

        return savedAssignment;
    }

    async getAssignee(positionId: string): Promise<EmployeeProfile | null> {
        return this.employeeProfileModel.findOne({ primaryPositionId: new Types.ObjectId(positionId) }).exec();
    }
}

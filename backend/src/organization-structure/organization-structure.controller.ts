import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationStructureService } from './organization-structure.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AssignPositionDto } from './dto/assign-position.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ALL_EMPLOYEE_ROLES } from '../employee-profile/enums/employee-profile.enums';

@ApiTags('Organization Structure')
@ApiBearerAuth()
@Controller('api/organization-structure')
export class OrganizationStructureController {
    constructor(private readonly organizationStructureService: OrganizationStructureService) { }

    // --- Change Requests ---

    @Post('change-requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'Department Head')
    @ApiOperation({ summary: 'Create organization structure change request', description: 'Allowed roles: HR Admin, HR Manager, Department Head' })
    createChangeRequest(@Body() createChangeRequestDto: CreateChangeRequestDto, @Req() req: any) {
        createChangeRequestDto.requestedByEmployeeId = req.user.userId;
        return this.organizationStructureService.createChangeRequest(createChangeRequestDto);
    }

    @Get('change-requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Get all change requests', description: 'Allowed roles: HR Admin, HR Manager' })
    findAllChangeRequests(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('status') status?: string
    ) {
        return this.organizationStructureService.findAllChangeRequests(
            parseInt(page, 10),
            parseInt(limit, 10),
            status
        );
    }

    @Get('change-requests/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Get change request by ID', description: 'Allowed roles: HR Admin, HR Manager' })
    findOneChangeRequest(@Param('id') id: string) {
        return this.organizationStructureService.findOneChangeRequest(id);
    }

    @Patch('change-requests/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Approve organization change request', description: 'Allowed roles: HR Admin, HR Manager' })
    approveChangeRequest(@Param('id') id: string) {
        return this.organizationStructureService.approveChangeRequest(id);
    }

    @Patch('change-requests/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Reject organization change request', description: 'Allowed roles: HR Admin, HR Manager' })
    rejectChangeRequest(@Param('id') id: string) {
        return this.organizationStructureService.rejectChangeRequest(id);
    }

    // --- Departments ---

    @Post('departments')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Create department', description: 'Allowed roles: HR Admin, HR Manager' })
    createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
        return this.organizationStructureService.createDepartment(createDepartmentDto);
    }

    @Get('departments')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get all departments', description: 'Allowed roles: All authenticated users' })
    findAllDepartments() {
        return this.organizationStructureService.findAllDepartments();
    }

    @Get('departments/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get department by ID', description: 'Allowed roles: All authenticated users' })
    findOneDepartment(@Param('id') id: string) {
        return this.organizationStructureService.findOneDepartment(id);
    }

    @Patch('departments/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Update department', description: 'Allowed roles: HR Admin, HR Manager' })
    updateDepartment(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
        return this.organizationStructureService.updateDepartment(id, updateDepartmentDto);
    }

    @Delete('departments/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Delete department', description: 'Allowed roles: HR Admin, HR Manager' })
    removeDepartment(@Param('id') id: string) {
        return this.organizationStructureService.removeDepartment(id);
    }

    @Patch('departments/:id/activate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Activate department', description: 'Allowed roles: HR Admin, HR Manager' })
    activateDepartment(@Param('id') id: string) {
        return this.organizationStructureService.activateDepartment(id);
    }

    @Patch('departments/:id/deactivate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Deactivate department', description: 'Allowed roles: HR Admin, HR Manager' })
    deactivateDepartment(@Param('id') id: string) {
        return this.organizationStructureService.deactivateDepartment(id);
    }

    @Get('departments/:id/positions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get positions in department', description: 'Allowed roles: All authenticated users' })
    findPositionsByDepartment(@Param('id') id: string) {
        return this.organizationStructureService.findPositionsByDepartment(id);
    }

    @Get('hierarchy')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get full organizational hierarchy', description: 'Allowed roles: All authenticated users' })
    getFullHierarchy() {
        return this.organizationStructureService.getFullHierarchy();
    }

    @Get('hierarchy/department/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get department hierarchy', description: 'Allowed roles: All authenticated users' })
    getDepartmentHierarchy(@Param('id') id: string) {
        return this.organizationStructureService.getDepartmentHierarchy(id);
    }

    // --- Positions ---

    @Post('positions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Create position', description: 'Allowed roles: HR Admin, HR Manager' })
    createPosition(@Body() createPositionDto: CreatePositionDto) {
        return this.organizationStructureService.createPosition(createPositionDto);
    }

    @Get('positions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get all positions', description: 'Allowed roles: All authenticated users' })
    findAllPositions() {
        return this.organizationStructureService.findAllPositions();
    }

    @Get('positions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get position by ID', description: 'Allowed roles: All authenticated users' })
    findOnePosition(@Param('id') id: string) {
        return this.organizationStructureService.findOnePosition(id);
    }

    @Patch('positions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Update position', description: 'Allowed roles: HR Admin, HR Manager' })
    updatePosition(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
        return this.organizationStructureService.updatePosition(id, updatePositionDto);
    }

    @Delete('positions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Delete position', description: 'Allowed roles: HR Admin, HR Manager' })
    removePosition(@Param('id') id: string) {
        return this.organizationStructureService.removePosition(id);
    }

    @Patch('positions/:id/activate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Activate position', description: 'Allowed roles: HR Admin, HR Manager' })
    activatePosition(@Param('id') id: string) {
        return this.organizationStructureService.activatePosition(id);
    }

    @Patch('positions/:id/deactivate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Deactivate position', description: 'Allowed roles: HR Admin, HR Manager' })
    deactivatePosition(@Param('id') id: string) {
        return this.organizationStructureService.deactivatePosition(id);
    }

    // --- Assignments ---

    @Post('assignments')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Assign employee to position', description: 'Allowed roles: HR Admin, HR Manager' })
    assignPosition(@Body() assignPositionDto: AssignPositionDto) {
        return this.organizationStructureService.assignPosition(assignPositionDto);
    }

    @Get('positions/:id/assignee')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get position assignee', description: 'Allowed roles: All authenticated users' })
    getAssignee(@Param('id') id: string) {
        return this.organizationStructureService.getAssignee(id);
    }

    @Get('my-team')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...ALL_EMPLOYEE_ROLES)
    @ApiOperation({ summary: 'Get my direct reports', description: 'Allowed roles: All authenticated users' })
    getMyTeam(@Req() req: any) {
        return this.organizationStructureService.getMyTeam(req.user.userId);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { AssignAppraisalDto } from './dto/assign-appraisal.dto';
import { BulkAssignAppraisalsDto } from './dto/bulk-assign-appraisals.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { SelfAssessmentDto } from './dto/self-assessment.dto';
import { RaiseDisputeDto } from './dto/raise-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { BulkPublishDto } from './dto/bulk-publish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Performance Management')
@ApiBearerAuth()
@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) { }

    // --- Templates ---

    @Post('templates')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Create appraisal template', description: 'Allowed roles: HR Admin, HR Manager' })
    createTemplate(@Body() dto: CreateTemplateDto) {
        return this.performanceService.createTemplate(dto);
    }

    @Get('templates')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'HR Employee')
    @ApiOperation({ summary: 'Get all templates', description: 'Allowed roles: HR Admin, HR Manager, HR Employee' })
    findAllTemplates() {
        return this.performanceService.findAllTemplates();
    }

    @Get('templates/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'HR Employee')
    @ApiOperation({ summary: 'Get template by ID', description: 'Allowed roles: HR Admin, HR Manager, HR Employee' })
    findOneTemplate(@Param('id') id: string) {
        return this.performanceService.findOneTemplate(id);
    }

    @Patch('templates/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Update template', description: 'Allowed roles: HR Admin, HR Manager' })
    updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
        return this.performanceService.updateTemplate(id, dto);
    }

    @Delete('templates/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Delete template', description: 'Allowed roles: HR Admin, HR Manager' })
    deleteTemplate(@Param('id') id: string) {
        return this.performanceService.deleteTemplate(id);
    }

    // --- Cycles ---

    @Post('cycles')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Create appraisal cycle', description: 'Allowed roles: HR Admin, HR Manager' })
    createCycle(@Body() dto: CreateCycleDto) {
        return this.performanceService.createCycle(dto);
    }

    @Get('cycles')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'HR Employee')
    @ApiOperation({ summary: 'Get all cycles', description: 'Allowed roles: HR Admin, HR Manager, HR Employee' })
    findAllCycles() {
        return this.performanceService.findAllCycles();
    }

    @Get('cycles/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'HR Employee')
    @ApiOperation({ summary: 'Get cycle by ID', description: 'Allowed roles: HR Admin, HR Manager, HR Employee' })
    findOneCycle(@Param('id') id: string) {
        return this.performanceService.findOneCycle(id);
    }

    @Patch('cycles/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Update cycle', description: 'Allowed roles: HR Admin, HR Manager' })
    updateCycle(@Param('id') id: string, @Body() dto: UpdateCycleDto) {
        return this.performanceService.updateCycle(id, dto);
    }

    // --- Appraisals ---

    @Post('appraisals')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Assign appraisal to employee', description: 'Allowed roles: HR Admin, HR Manager' })
    assignAppraisal(@Body() dto: AssignAppraisalDto) {
        return this.performanceService.assignAppraisal(dto);
    }

    @Post('appraisals/bulk-assign')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Bulk assign appraisals', description: 'Allowed roles: HR Admin, HR Manager' })
    bulkAssignAppraisals(@Body() dto: BulkAssignAppraisalsDto) {
        return this.performanceService.bulkAssignAppraisals(dto);
    }

    @Post('appraisals/bulk-publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Bulk publish appraisals', description: 'Allowed roles: HR Admin, HR Manager' })
    bulkPublishAppraisals(
        @Body() dto: BulkPublishDto,
        @Query('publishedBy') publishedBy: string,
    ) {
        return this.performanceService.bulkPublishAppraisals(dto, publishedBy);
    }

    @Get('appraisals/my-appraisals')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get my appraisals (employee view)', description: 'Allowed roles: All authenticated users' })
    getMyAppraisals(@Query('employeeId') employeeId: string) {
        return this.performanceService.getMyAppraisals(employeeId);
    }

    @Get('appraisals/my-appraisals/published')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get my published appraisals', description: 'Allowed roles: All authenticated users' })
    getMyPublishedAppraisals(@Query('employeeId') employeeId: string) {
        return this.performanceService.getMyPublishedAppraisals(employeeId);
    }

    @Get('appraisals/my-team')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'Department Head', 'HR Employee')
    @ApiOperation({ summary: 'Get my team appraisals', description: 'Allowed roles: HR Admin, HR Manager, Department Head' })
    getMyTeamAppraisals(@Query('managerId') managerId: string) {
        return this.performanceService.getMyTeamAppraisals(managerId);
    }

    @Get('appraisals/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'HR Employee', 'Department Head')
    @ApiOperation({ summary: 'Get appraisal by ID', description: 'Allowed roles: HR Admin, HR Manager, HR Employee, Department Head' })
    getAppraisalByAssignmentId(@Param('id') id: string) {
        return this.performanceService.getAppraisalByAssignmentId(id);
    }

    @Post('appraisals/:id/feedback')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'Department Head', 'HR Employee')
    @ApiOperation({ summary: 'Submit manager feedback on appraisal', description: 'Allowed roles: HR Admin, HR Manager, Department Head' })
    submitManagerFeedback(@Param('id') id: string, @Body() dto: SubmitFeedbackDto) {
        return this.performanceService.submitManagerFeedback(id, dto);
    }

    @Post('appraisals/:id/self-assessment')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Submit self assessment', description: 'Allowed roles: All authenticated users' })
    submitSelfAssessment(@Param('id') id: string, @Body() dto: SelfAssessmentDto) {
        return this.performanceService.submitSelfAssessment(id, dto);
    }

    @Patch('appraisals/:id/finalize')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Finalize and publish appraisal', description: 'Allowed roles: HR Admin, HR Manager' })
    finalizeAppraisal(
        @Param('id') id: string,
        @Body('publishedBy') publishedBy: string,
    ) {
        return this.performanceService.finalizeAppraisal(id, publishedBy);
    }

    @Post('appraisals/:id/view')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Mark appraisal as viewed', description: 'Allowed roles: All authenticated users' })
    markAppraisalAsViewed(@Param('id') id: string) {
        return this.performanceService.markAppraisalAsViewed(id);
    }

    @Post('appraisals/:id/acknowledge')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Acknowledge appraisal', description: 'Allowed roles: All authenticated users' })
    acknowledgeAppraisal(
        @Param('id') id: string,
        @Body('comment') comment?: string,
    ) {
        return this.performanceService.acknowledgeAppraisal(id, comment);
    }

    // --- Disputes ---

    @Post('appraisals/:id/dispute')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Raise dispute on appraisal', description: 'Allowed roles: All authenticated users' })
    raiseDispute(
        @Param('id') id: string,
        @Body() dto: RaiseDisputeDto,
        @Query('employeeId') employeeId: string,
    ) {
        return this.performanceService.raiseDispute(id, employeeId, dto);
    }

    @Patch('disputes/:id/resolve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Resolve appraisal dispute', description: 'Allowed roles: HR Admin, HR Manager' })
    resolveDispute(
        @Param('id') id: string,
        @Body() dto: ResolveDisputeDto,
        @Query('resolverId') resolverId: string,
    ) {
        return this.performanceService.resolveDispute(id, resolverId, dto);
    }

    @Get('disputes')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Get all appraisal disputes', description: 'Allowed roles: HR Admin, HR Manager' })
    findAllDisputes() {
        return this.performanceService.findAllDisputes();
    }

    @Get('disputes/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'HR Employee')
    @ApiOperation({ summary: 'Get dispute by ID', description: 'Allowed roles: HR Admin, HR Manager, HR Employee' })
    findOneDispute(@Param('id') id: string) {
        return this.performanceService.findOneDispute(id);
    }

    // --- Dashboard ---

    @Get('dashboard/pending')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Get pending appraisals', description: 'Allowed roles: HR Admin, HR Manager' })
    getPendingAppraisals() {
        return this.performanceService.getPendingAppraisals();
    }

    @Get('dashboard/progress')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Get appraisal progress dashboard', description: 'Allowed roles: HR Admin, HR Manager' })
    getAppraisalProgress() {
        return this.performanceService.getAppraisalProgress();
    }

    // --- History ---

    @Get('history/my-history')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get my appraisal history', description: 'Allowed roles: All authenticated users' })
    getMyHistory(@Query('employeeId') employeeId: string) {
        return this.performanceService.getMyHistory(employeeId);
    }

    @Get('history/:employeeId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager', 'Department Head')
    @ApiOperation({ summary: 'Get employee appraisal history', description: 'Allowed roles: HR Admin, HR Manager, Department Head' })
    getEmployeeHistory(@Param('employeeId') employeeId: string) {
        return this.performanceService.getEmployeeHistory(employeeId);
    }

    // --- Reports ---

    @Get('reports/cycle/:cycleId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('HR Admin', 'HR Manager')
    @ApiOperation({ summary: 'Get appraisal cycle report', description: 'Allowed roles: HR Admin, HR Manager' })
    getCycleReport(@Param('cycleId') cycleId: string) {
        return this.performanceService.getCycleReport(cycleId);
    }
}

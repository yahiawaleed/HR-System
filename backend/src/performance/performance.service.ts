import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppraisalTemplate, AppraisalTemplateDocument } from './models/appraisal-template.schema';
import { AppraisalCycle, AppraisalCycleDocument } from './models/appraisal-cycle.schema';
import { AppraisalAssignment, AppraisalAssignmentDocument } from './models/appraisal-assignment.schema';
import { AppraisalRecord, AppraisalRecordDocument } from './models/appraisal-record.schema';
import { AppraisalDispute, AppraisalDisputeDocument } from './models/appraisal-dispute.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
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
import { AppraisalAssignmentStatus, AppraisalRecordStatus, AppraisalCycleStatus } from './enums/performance.enums';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/models/notification.schema';

@Injectable()
export class PerformanceService {
    constructor(
        @InjectModel(AppraisalTemplate.name) private templateModel: Model<AppraisalTemplateDocument>,
        @InjectModel(AppraisalCycle.name) private cycleModel: Model<AppraisalCycleDocument>,
        @InjectModel(AppraisalAssignment.name) private assignmentModel: Model<AppraisalAssignmentDocument>,
        @InjectModel(AppraisalRecord.name) private recordModel: Model<AppraisalRecordDocument>,
        @InjectModel(AppraisalDispute.name) private disputeModel: Model<AppraisalDisputeDocument>,
        @InjectModel('EmployeeProfile') private employeeModel: Model<EmployeeProfileDocument>,
        private notificationService: NotificationService,
    ) { }

    // --- Templates ---

    async createTemplate(dto: CreateTemplateDto): Promise<AppraisalTemplate> {
        const template = new this.templateModel(dto);
        return template.save();
    }

    async findAllTemplates(): Promise<AppraisalTemplate[]> {
        return this.templateModel.find().exec();
    }

    async findOneTemplate(id: string): Promise<AppraisalTemplate> {
        const template = await this.templateModel.findById(id).exec();
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found`);
        }
        return template;
    }

    async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<AppraisalTemplate> {
        const template = await this.templateModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found`);
        }
        return template;
    }

    async deleteTemplate(id: string): Promise<AppraisalTemplate> {
        const template = await this.templateModel.findByIdAndDelete(id).exec();
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found`);
        }
        return template;
    }

    // --- Cycles ---

    async createCycle(dto: CreateCycleDto): Promise<AppraisalCycle> {
        const cycle = new this.cycleModel(dto);
        return cycle.save();
    }

    async findAllCycles(): Promise<AppraisalCycle[]> {
        return this.cycleModel.find().exec();
    }

    async findOneCycle(id: string): Promise<AppraisalCycle> {
        const cycle = await this.cycleModel.findById(id).exec();
        if (!cycle) {
            throw new NotFoundException(`Cycle with ID ${id} not found`);
        }
        return cycle;
    }

    async updateCycle(id: string, dto: UpdateCycleDto): Promise<AppraisalCycle> {
        const cycle = await this.cycleModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!cycle) {
            throw new NotFoundException(`Cycle with ID ${id} not found`);
        }
        return cycle;
    }

    // --- Appraisals ---

    async assignAppraisal(dto: AssignAppraisalDto): Promise<AppraisalAssignment> {
        const assignment = new this.assignmentModel({
            ...dto,
            cycleId: new Types.ObjectId(dto.cycleId),
            templateId: new Types.ObjectId(dto.templateId),
            employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
            managerProfileId: new Types.ObjectId(dto.managerProfileId),
            departmentId: new Types.ObjectId(dto.departmentId),
            positionId: dto.positionId ? new Types.ObjectId(dto.positionId) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        });

        const savedAssignment = await assignment.save();

        // Notify Employee
        await this.notificationService.createNotification({
            recipientId: dto.employeeProfileId,
            type: NotificationType.APPRAISAL_ASSIGNED,
            title: 'New Appraisal Assigned',
            message: 'You have been assigned a new performance appraisal.',
            relatedEntityId: savedAssignment._id.toString(),
            relatedEntityType: 'AppraisalAssignment',
            actionUrl: `/dashboard/performance/appraisals/${savedAssignment._id}/self-assessment`,
        });

        // Notify Manager
        await this.notificationService.createNotification({
            recipientId: dto.managerProfileId,
            type: NotificationType.APPRAISAL_ASSIGNED,
            title: 'New Appraisal to Review',
            message: 'You have been assigned to review a new appraisal.',
            relatedEntityId: savedAssignment._id.toString(),
            relatedEntityType: 'AppraisalAssignment',
            actionUrl: `/dashboard/performance/appraisals/${savedAssignment._id}/feedback`,
        });

        return savedAssignment;
    }

    async bulkAssignAppraisals(dto: BulkAssignAppraisalsDto): Promise<AppraisalAssignment[]> {
        const assignments = dto.employees.map(emp => ({
            cycleId: new Types.ObjectId(dto.cycleId),
            templateId: new Types.ObjectId(dto.templateId),
            employeeProfileId: new Types.ObjectId(emp.employeeProfileId),
            managerProfileId: new Types.ObjectId(emp.managerProfileId),
            departmentId: new Types.ObjectId(dto.departmentId),
            positionId: emp.positionId ? new Types.ObjectId(emp.positionId) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        }));

        const savedAssignments = await this.assignmentModel.insertMany(assignments);

        // Send notifications asynchronously to avoid blocking
        savedAssignments.forEach(async (assignment) => {
            // Notify Employee
            await this.notificationService.createNotification({
                recipientId: assignment.employeeProfileId.toString(),
                type: NotificationType.APPRAISAL_ASSIGNED,
                title: 'New Appraisal Assigned',
                message: 'You have been assigned a new performance appraisal.',
                relatedEntityId: assignment._id.toString(),
                relatedEntityType: 'AppraisalAssignment',
                actionUrl: `/dashboard/performance/appraisals/${assignment._id}/self-assessment`,
            });
            // Notify Manager
            await this.notificationService.createNotification({
                recipientId: assignment.managerProfileId.toString(),
                type: NotificationType.APPRAISAL_ASSIGNED,
                title: 'New Appraisal to Review',
                message: 'You have been assigned to review a new appraisal.',
                relatedEntityId: assignment._id.toString(),
                relatedEntityType: 'AppraisalAssignment',
                actionUrl: `/dashboard/performance/appraisals/${assignment._id}/feedback`,
            });
        });

        return savedAssignments;
    }

    async getAppraisalByAssignmentId(assignmentId: string): Promise<any> {
        const assignment = await this.assignmentModel.findById(assignmentId)
            .populate('cycleId')
            .populate('templateId')
            .populate('employeeProfileId')
            .populate('managerProfileId')
            .exec();

        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }

        const record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();

        return { assignment, record };
    }

    async submitManagerFeedback(assignmentId: string, dto: SubmitFeedbackDto): Promise<AppraisalRecord> {
        const assignment = await this.assignmentModel.findById(assignmentId).exec();
        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }

        let record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();

        // Flatten sections to ratings
        const ratings: Array<{ key: string; title: string; ratingValue: number; comments?: string }> = [];
        let totalScore = 0;
        let count = 0;

        dto.sections?.forEach(section => {
            section.criteria?.forEach(criterion => {
                ratings.push({
                    key: criterion.name,
                    title: criterion.name,
                    ratingValue: criterion.managerRating,
                    comments: criterion.managerComment,
                });
                totalScore += criterion.managerRating;
                count++;
            });
        });

        // Simple average for total score (can be weighted logic if weights are provided)
        const finalScore = count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0;

        if (!record) {
            record = new this.recordModel({
                assignmentId: assignment._id,
                cycleId: assignment.cycleId,
                templateId: assignment.templateId,
                employeeProfileId: assignment.employeeProfileId,
                managerProfileId: assignment.managerProfileId,
                ratings: ratings,
                totalScore: finalScore,
                managerSummary: dto.managerFeedback,
                status: AppraisalRecordStatus.DRAFT,
            });
        } else {
            record.ratings = ratings;
            record.totalScore = finalScore;
            record.managerSummary = dto.managerFeedback;
        }

        record.managerSubmittedAt = new Date();
        record.status = AppraisalRecordStatus.MANAGER_SUBMITTED;
        assignment.status = AppraisalAssignmentStatus.SUBMITTED;
        assignment.submittedAt = new Date();

        await assignment.save();
        const savedRecord = await record.save();

        // Notifications would go here...
        // Notification to Manager (Confirmation)
        await this.notificationService.createNotification({
            recipientId: assignment.managerProfileId.toString(),
            type: NotificationType.SYSTEM_ALERT,
            title: 'Feedback Submitted',
            message: 'Your appraisal feedback has been submitted successfully.',
            relatedEntityId: savedRecord._id.toString(),
            relatedEntityType: 'AppraisalRecord',
            actionUrl: `/dashboard/performance/appraisals/${assignment._id}`,
        });

        return savedRecord;
    }


    async submitSelfAssessment(assignmentId: string, dto: SelfAssessmentDto): Promise<AppraisalRecord> {
        const assignment = await this.assignmentModel.findById(assignmentId).exec();
        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }

        let record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();

        if (!record) {
            record = new this.recordModel({
                assignmentId: assignment._id,
                cycleId: assignment.cycleId,
                templateId: assignment.templateId,
                employeeProfileId: assignment.employeeProfileId,
                managerProfileId: assignment.managerProfileId,
                status: AppraisalRecordStatus.DRAFT,
            });
        }

        // Update fields
        record.strengths = dto.strengths;
        record.improvementAreas = dto.weaknesses; // Mapping 'weaknesses' to 'improvementAreas'
        record.achievements = dto.achievements;
        record.goals = dto.goals;

        const savedRecord = await record.save();

        // Update Assignment Status to IN_PROGRESS if it was NOT_STARTED
        if (assignment.status === AppraisalAssignmentStatus.NOT_STARTED) {
            assignment.status = AppraisalAssignmentStatus.IN_PROGRESS;
            await assignment.save();
        }

        return savedRecord;
    }

    async finalizeAppraisal(assignmentId: string, employeeIdWhoPublished: string): Promise<AppraisalRecord> {
        const assignment = await this.assignmentModel.findById(assignmentId).exec();
        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }

        const record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();
        if (!record) {
            throw new NotFoundException(`No record found for assignment ${assignmentId}`);
        }

        record.status = AppraisalRecordStatus.HR_PUBLISHED;
        record.hrPublishedAt = new Date();
        record.publishedByEmployeeId = new Types.ObjectId(employeeIdWhoPublished);

        assignment.status = AppraisalAssignmentStatus.PUBLISHED;
        assignment.publishedAt = new Date();
        assignment.latestAppraisalId = record._id;

        // Update Employee Profile with latest appraisal data
        await this.employeeModel.findByIdAndUpdate(assignment.employeeProfileId, {
            lastAppraisalRecordId: record._id,
            lastAppraisalCycleId: assignment.cycleId,
            lastAppraisalTemplateId: assignment.templateId,
            lastAppraisalDate: record.hrPublishedAt,
            lastAppraisalScore: record.totalScore,
            lastAppraisalRatingLabel: record.overallRatingLabel,
        }).exec();

        await assignment.save();
        const savedRecord = await record.save();

        // Notify Employee
        await this.notificationService.createNotification({
            recipientId: assignment.employeeProfileId.toString(),
            type: NotificationType.APPRAISAL_PUBLISHED,
            title: 'Appraisal Published',
            message: `Your appraisal has been published. Final Score: ${savedRecord.totalScore}`,
            relatedEntityId: savedRecord._id.toString(),
            relatedEntityType: 'AppraisalRecord',
            actionUrl: `/dashboard/performance/history/${assignment.employeeProfileId}`,
        });

        return savedRecord;
    }

    async bulkPublishAppraisals(dto: BulkPublishDto, employeeIdWhoPublished: string): Promise<any> {
        const results: any[] = [];
        for (const assignmentId of dto.assignmentIds) {
            try {
                const result = await this.finalizeAppraisal(assignmentId, employeeIdWhoPublished);
                results.push({ assignmentId, success: true, result });
            } catch (error) {
                results.push({ assignmentId, success: false, error: error.message });
            }
        }
        return results;
    }

    async markAppraisalAsViewed(assignmentId: string): Promise<AppraisalRecord> {
        const record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();
        if (!record) {
            throw new NotFoundException(`No record found for assignment ${assignmentId}`);
        }

        record.employeeViewedAt = new Date();
        return record.save();
    }

    async acknowledgeAppraisal(assignmentId: string, comment?: string): Promise<AppraisalRecord> {
        const assignment = await this.assignmentModel.findById(assignmentId).exec();
        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }

        const record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();
        if (!record) {
            throw new NotFoundException(`No record found for assignment ${assignmentId}`);
        }

        record.employeeAcknowledgedAt = new Date();
        if (comment) {
            record.employeeAcknowledgementComment = comment;
        }

        assignment.status = AppraisalAssignmentStatus.ACKNOWLEDGED;

        await assignment.save();
        return record.save();
    }

    async getMyAppraisals(employeeId: string): Promise<AppraisalAssignment[]> {
        return this.assignmentModel.find({ employeeProfileId: new Types.ObjectId(employeeId) })
            .populate('cycleId')
            .populate('templateId')
            .populate('managerProfileId')
            .exec();
    }

    async getMyPublishedAppraisals(employeeId: string): Promise<AppraisalAssignment[]> {
        return this.assignmentModel.find({
            employeeProfileId: new Types.ObjectId(employeeId),
            status: AppraisalAssignmentStatus.PUBLISHED,
        })
            .populate('cycleId')
            .populate('templateId')
            .exec();
    }

    async getMyTeamAppraisals(managerId: string): Promise<AppraisalAssignment[]> {
        return this.assignmentModel.find({ managerProfileId: new Types.ObjectId(managerId) })
            .populate('cycleId')
            .populate('templateId')
            .populate('employeeProfileId')
            .exec();
    }

    // --- Disputes ---

    async raiseDispute(assignmentId: string, employeeId: string, dto: RaiseDisputeDto): Promise<AppraisalDispute> {
        const assignment = await this.assignmentModel.findById(assignmentId).exec();
        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }

        const record = await this.recordModel.findOne({ assignmentId: new Types.ObjectId(assignmentId) }).exec();
        if (!record) {
            throw new NotFoundException(`No record found for assignment ${assignmentId}`);
        }

        // BR 31: Validate 7-day dispute window from appraisal publication/completion
        const recordDoc = record as any;
        const publishedAt = recordDoc.publishedAt || recordDoc.hrPublishedAt;
        if (publishedAt) {
            const daysSincePublication = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSincePublication > 7) {
                throw new BadRequestException(
                    `Dispute window has closed. Appraisals can only be disputed within 7 days of completion. ` +
                    `This appraisal was published ${Math.floor(daysSincePublication)} days ago. (BR 31)`
                );
            }
        }

        const dispute = new this.disputeModel({
            appraisalId: record._id,
            assignmentId: assignment._id,
            cycleId: assignment.cycleId,
            raisedByEmployeeId: new Types.ObjectId(employeeId),
            ...dto,
        });

        const savedDispute = await dispute.save();

        // Notify Manager (Evaluator)
        await this.notificationService.createNotification({
            recipientId: assignment.managerProfileId.toString(),
            type: NotificationType.APPRAISAL_DISPUTE,
            title: 'Appraisal Dispute Raised',
            message: 'An employee has raised a dispute on an appraisal you managed.',
            relatedEntityId: savedDispute._id.toString(),
            relatedEntityType: 'AppraisalDispute',
            actionUrl: `/dashboard/performance/disputes/${savedDispute._id}`,
        });

        return savedDispute;
    }

    async resolveDispute(disputeId: string, resolverId: string, dto: ResolveDisputeDto): Promise<AppraisalDispute> {
        const dispute = await this.disputeModel.findById(disputeId).exec();
        if (!dispute) {
            throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
        }

        dispute.resolutionSummary = dto.resolutionSummary;
        dispute.resolvedAt = new Date();
        dispute.resolvedByEmployeeId = new Types.ObjectId(resolverId);
        dispute.status = 'ADJUSTED' as any; // or REJECTED based on business logic

        return dispute.save();
    }

    async findAllDisputes(): Promise<AppraisalDispute[]> {
        return this.disputeModel.find()
            .populate('raisedByEmployeeId')
            .populate('resolvedByEmployeeId')
            .exec();
    }

    async findOneDispute(id: string): Promise<AppraisalDispute> {
        const dispute = await this.disputeModel.findById(id)
            .populate('raisedByEmployeeId')
            .populate('resolvedByEmployeeId')
            .exec();
        if (!dispute) {
            throw new NotFoundException(`Dispute with ID ${id} not found`);
        }
        return dispute;
    }

    // --- Dashboard ---

    async getPendingAppraisals(): Promise<AppraisalAssignment[]> {
        return this.assignmentModel.find({
            status: { $in: [AppraisalAssignmentStatus.NOT_STARTED, AppraisalAssignmentStatus.IN_PROGRESS] },
        })
            .populate('employeeProfileId')
            .populate('managerProfileId')
            .exec();
    }

    async getAppraisalProgress(): Promise<any> {
        const total = await this.assignmentModel.countDocuments().exec();
        const notStarted = await this.assignmentModel.countDocuments({ status: AppraisalAssignmentStatus.NOT_STARTED }).exec();
        const inProgress = await this.assignmentModel.countDocuments({ status: AppraisalAssignmentStatus.IN_PROGRESS }).exec();
        const submitted = await this.assignmentModel.countDocuments({ status: AppraisalAssignmentStatus.SUBMITTED }).exec();
        const published = await this.assignmentModel.countDocuments({ status: AppraisalAssignmentStatus.PUBLISHED }).exec();
        const acknowledged = await this.assignmentModel.countDocuments({ status: AppraisalAssignmentStatus.ACKNOWLEDGED }).exec();

        return {
            total,
            notStarted,
            inProgress,
            submitted,
            published,
            acknowledged,
            completionRate: total > 0 ? ((submitted + published + acknowledged) / total * 100).toFixed(2) : 0,
        };
    }

    // --- History ---

    async getEmployeeHistory(employeeId: string): Promise<any> {
        if (!Types.ObjectId.isValid(employeeId)) {
            throw new BadRequestException('Invalid employee ID');
        }

        const records = await this.recordModel.find({ employeeProfileId: new Types.ObjectId(employeeId) })
            .populate('cycleId')
            .populate('templateId')
            .sort({ hrPublishedAt: -1 })
            .exec();

        return {
            employeeId,
            totalAppraisals: records.length,
            appraisals: records,
        };
    }

    async getMyHistory(employeeId: string): Promise<any> {
        return this.getEmployeeHistory(employeeId);
    }

    // --- Reports ---

    async getCycleReport(cycleId: string): Promise<any> {
        const assignments = await this.assignmentModel.find({ cycleId: new Types.ObjectId(cycleId) })
            .populate('employeeProfileId')
            .populate('departmentId')
            .exec();

        const records = await this.recordModel.find({ cycleId: new Types.ObjectId(cycleId) }).exec();

        return {
            cycleId,
            totalAssignments: assignments.length,
            totalCompleted: records.length,
            assignments,
            records,
        };
    }
}

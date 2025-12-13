import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobRequisition } from './models/job-requisition.schema';
import { JobTemplate } from './models/job-template.schema';
import { Application } from './models/application.schema';
import { Offer, OfferDocument } from './models/offer.schema';
import { Onboarding } from './models/onboarding.schema';
import { ApplicationStatus } from './enums/application-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';

import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

@Injectable()
export class RecruitmentService {
    constructor(
        @InjectModel(JobRequisition.name) private jobModel: Model<JobRequisition>,
        @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplate>,
        @InjectModel(Application.name) private applicationModel: Model<Application>,
        @InjectModel(Offer.name) private offerModel: Model<Offer>,
        @InjectModel(Onboarding.name) private onboardingModel: Model<Onboarding>,
        @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
    ) { }

    // --- JOB REQUISITIONS ---

    async createJob(createJobDto: any): Promise<JobRequisition> {
        // 1. Create fields for Template
        const templateData = {
            title: createJobDto.title,
            department: createJobDto.department,
            qualifications: typeof createJobDto.qualifications === 'string' ? createJobDto.qualifications.split(',') : createJobDto.qualifications,
            skills: typeof createJobDto.skills === 'string' ? createJobDto.skills.split(',') : createJobDto.skills,
            description: createJobDto.description,
        };

        const newTemplate = new this.jobTemplateModel(templateData);
        const savedTemplate = await newTemplate.save();

        // 2. Create Requisition with link to Template
        const requisitionData = {
            ...createJobDto,
            templateId: savedTemplate._id,
        };

        const newJob = new this.jobModel(requisitionData);
        return newJob.save();
    }

    async findAllJobs(): Promise<any[]> {
        const jobs = await this.jobModel.find().populate('templateId').exec();
        return jobs.map(job => {
            const template = job.templateId as any;
            return {
                _id: job._id,
                requisitionId: job.requisitionId,
                openings: job.openings,
                location: job.location,
                hiringManagerId: job.hiringManagerId,
                publishStatus: job.publishStatus,
                postingDate: job.postingDate,
                expiryDate: job.expiryDate,
                // Template fields
                title: template?.title,
                department: template?.department,
                qualifications: template?.qualifications,
                skills: template?.skills,
                description: template?.description,
                createdAt: job['createdAt'],
                updatedAt: job['updatedAt']
            };
        });
    }

    async findJobById(id: string): Promise<any> {
        const job = await this.jobModel.findById(id).populate('templateId').exec();
        if (!job) throw new NotFoundException(`Job with ID ${id} not found`);

        // Flatten for frontend
        const template = job.templateId as any;
        return {
            _id: job._id,
            requisitionId: job.requisitionId,
            openings: job.openings,
            location: job.location,
            hiringManagerId: job.hiringManagerId,
            publishStatus: job.publishStatus,
            postingDate: job.postingDate,
            expiryDate: job.expiryDate,
            // Template fields
            title: template.title,
            department: template.department,
            qualifications: template.qualifications,
            skills: template.skills,
            description: template.description,
            createdAt: job['createdAt'], // access via index if type doesn't have it
            updatedAt: job['updatedAt']
        };
    }

    async deleteJob(id: string): Promise<void> {
        const result = await this.jobModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // --- APPLICATIONS ---

    async submitApplication(createApplicationDto: any): Promise<Application> {
        const application = new this.applicationModel(createApplicationDto);
        return application.save();
    }

    async findAllApplications(): Promise<Application[]> {
        return this.applicationModel.find().populate('requisitionId').exec();
    }

    async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
        const application = await this.applicationModel.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        ).exec();
        if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
        return application;
    }

    async deleteApplication(id: string): Promise<void> {
        const result = await this.applicationModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // --- OFFERS ---

    async createOffer(createOfferDto: any): Promise<Offer> {
        const offer = new this.offerModel(createOfferDto);
        return offer.save();
    }

    async acceptOffer(offerId: string): Promise<OfferDocument> {
        const offer = await this.offerModel.findById(offerId).exec();
        if (!offer) throw new NotFoundException('Offer not found');

        offer.applicantResponse = OfferResponseStatus.ACCEPTED;
        offer.finalStatus = OfferFinalStatus.APPROVED;
        await offer.save();

        // Trigger Onboarding
        await this.triggerOnboarding(offer);

        return offer;
    }

    async findAllOffers(): Promise<Offer[]> {
        return this.offerModel.find().exec();
    }

    // --- ONBOARDING & EMPLOYEES ---

    private async triggerOnboarding(offer: OfferDocument) {
        // 1. Create Employee Profile
        // We'll use candidateId from Offer as the name/identifier since we don't have a separate Candidate Module logic here
        // ideally candidateId is an ID to a Candidate document, but checking Application schema it is a string.
        // We will treat it as "Candidate Name" or similar for now if strictly string, or generate a new Employee.

        // Generate a random employee number
        const employeeNumber = `EMP-${Date.now().toString().slice(-6)}`;

        // Try to split candidateId into names if it looks like a name, otherwise use as is
        const nameParts = offer.candidateId.split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Candidate';

        // NOTE: EmployeeProfile schema requires `employeeNumber`, `dateOfHire`, `status`.
        // It extends UserProfileBase which usually has firstName, lastName, personalEmail, etc.
        // We will try our best to map data.

        const newEmployee = new this.employeeModel({
            employeeNumber: employeeNumber,
            firstName: firstName,
            lastName: lastName,
            nationalId: `NID-${Date.now()}`, // Placeholder National ID
            personalEmail: `${firstName}.${lastName}@example.com`.toLowerCase(), // Placeholder
            workEmail: `${firstName}.${lastName}@company.com`.toLowerCase(),
            dateOfHire: new Date(),
            status: 'ACTIVE', // Correct Enum value (uppercase)
            // Let's import Enum if needed, or string literal if compatible.
            // checking schema: enum: Object.values(EmployeeStatus), default: EmployeeStatus.ACTIVE

            // We'll rely on defaults for most things.
            primaryPositionId: null, // Would link to real position
            payrollEnabled: true,
            itAccessEnabled: true
        });

        const savedEmployee = await newEmployee.save();
        console.log(`Created Employee ${savedEmployee.employeeNumber} from Offer ${offer._id}`);

        // 2. Create Onboarding Record linked to this Employee
        const newOnboarding = new this.onboardingModel({
            employeeId: savedEmployee._id,
            contractId: new Types.ObjectId(),
            tasks: [],
            completed: false
        });

        await newOnboarding.save();
        console.log(`Onboarding triggered for Employee ${savedEmployee._id}`);
    }

    async getOnboardingStatus(id: string): Promise<Onboarding> {
        const onboarding = await this.onboardingModel.findById(id).exec();
        if (!onboarding) throw new NotFoundException('Onboarding not found');
        return onboarding;
    }

    async findAllEmployees(): Promise<EmployeeProfile[]> {
        return this.employeeModel.find().exec();
    }

    async deleteEmployee(id: string): Promise<void> {
        const result = await this.employeeModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`Employee with ID ${id} not found`);
    }
}

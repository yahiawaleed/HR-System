import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobRequisition } from './models/job-requisition.schema';
import { Application } from './models/application.schema';
import { Offer, OfferDocument } from './models/offer.schema';
import { Onboarding } from './models/onboarding.schema';
import { ApplicationStatus } from './enums/application-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';

@Injectable()
export class RecruitmentService {
    constructor(
        @InjectModel(JobRequisition.name) private jobModel: Model<JobRequisition>,
        @InjectModel(Application.name) private applicationModel: Model<Application>,
        @InjectModel(Offer.name) private offerModel: Model<Offer>,
        @InjectModel(Onboarding.name) private onboardingModel: Model<Onboarding>,
    ) { }

    // --- JOB REQUISITIONS ---

    async createJob(createJobDto: any): Promise<JobRequisition> {
        const newJob = new this.jobModel(createJobDto);
        return newJob.save();
    }

    async findAllJobs(): Promise<JobRequisition[]> {
        return this.jobModel.find().exec();
    }

    async findJobById(id: string): Promise<JobRequisition> {
        const job = await this.jobModel.findById(id).exec();
        if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
        return job;
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
        // Assuming applicantResponse is also ACCEPTED, logic can be added here
        await offer.save();

        // Trigger Onboarding
        await this.triggerOnboarding(offer);

        return offer;
    }

    // --- ONBOARDING ---

    private async triggerOnboarding(offer: OfferDocument) {
        // For now, we create a placeholder onboarding record.
        // In a real scenario, we would transfer data from Candidate to EmployeeProfile here.
        // Since we don't have EmployeeProfile service injected yet or Candidate model detailed,
        // we will assume the offer contains enough info or we'll update this later.

        // NOTE: This logic assumes 'candidateId' from Offer corresponds to a created Employee or needs to be converted.
        // For this step, we'll create a dummy Onboarding record.

        // We need an employeeId. Since we haven't created one, we'll mock it or use candidateId for now if schemas allow,
        // but Onboarding schema requires 'employeeId' ref 'EmployeeProfile'.
        // Use a placeholder or generated ID if strict Mode allows, otherwise this might fail at runtime if DB checks refs.
        // Using a new ObjectId for now.

        const newOnboarding = new this.onboardingModel({
            employeeId: new Types.ObjectId(), // Placeholder for the actual new employee ID
            contractId: new Types.ObjectId(), // Placeholder
            tasks: [],
            completed: false
        });

        await newOnboarding.save();
        console.log(`Onboarding triggered for Offer ${offer._id}`);
    }

    async getOnboardingStatus(id: string): Promise<Onboarding> {
        const onboarding = await this.onboardingModel.findById(id).exec();
        if (!onboarding) throw new NotFoundException('Onboarding not found');
        return onboarding;
    }
}

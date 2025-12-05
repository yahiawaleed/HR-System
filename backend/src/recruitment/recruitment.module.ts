import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecruitmentService } from './services/recruitment.service';
import { OnboardingService } from './services/onboarding.service';
import { OffboardingService } from './services/offboarding.service';
import { RecruitmentController } from './controllers/recruitment.controller';
import { OnboardingController } from './controllers/onboarding.controller';
import { OffboardingController } from './controllers/offboarding.controller';
import { JobPostingSchema } from './schemas/job-posting.schema';
import { CandidateSchema } from './schemas/candidate.schema';
import { JobOfferSchema } from './schemas/job-offer.schema';
import { OnboardingTaskSchema } from './schemas/onboarding-task.schema';
import { OffboardingChecklistSchema } from './schemas/offboarding-checklist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'JobPosting', schema: JobPostingSchema },
      { name: 'Candidate', schema: CandidateSchema },
      { name: 'JobOffer', schema: JobOfferSchema },
      { name: 'OnboardingTask', schema: OnboardingTaskSchema },
      { name: 'OffboardingChecklist', schema: OffboardingChecklistSchema },
    ]),
  ],
  controllers: [RecruitmentController, OnboardingController, OffboardingController],
  providers: [RecruitmentService, OnboardingService, OffboardingService],
  exports: [RecruitmentService, OnboardingService, OffboardingService],
})
export class RecruitmentModule {}


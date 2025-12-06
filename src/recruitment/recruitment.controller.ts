import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { ApplicationStatus } from './enums/application-status.enum';

@Controller('recruitment')
export class RecruitmentController {
    constructor(private readonly recruitmentService: RecruitmentService) { }

    @Post('jobs')
    createJob(@Body() createJobDto: any) {
        return this.recruitmentService.createJob(createJobDto);
    }

    @Get('jobs')
    findAllJobs() {
        return this.recruitmentService.findAllJobs();
    }

    @Post('applications')
    submitApplication(@Body() createApplicationDto: any) {
        return this.recruitmentService.submitApplication(createApplicationDto);
    }

    @Get('applications')
    findAllApplications() {
        return this.recruitmentService.findAllApplications();
    }

    @Patch('applications/:id/status')
    updateApplicationStatus(@Param('id') id: string, @Body('status') status: ApplicationStatus) {
        return this.recruitmentService.updateApplicationStatus(id, status);
    }

    @Post('offers')
    createOffer(@Body() createOfferDto: any) {
        return this.recruitmentService.createOffer(createOfferDto);
    }

    @Post('offers/:id/accept')
    acceptOffer(@Param('id') id: string) {
        return this.recruitmentService.acceptOffer(id);
    }
}

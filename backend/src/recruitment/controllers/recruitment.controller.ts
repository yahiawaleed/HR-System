import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { RecruitmentService } from '../services/recruitment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('recruitment')
@UseGuards(JwtAuthGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Postings
  @Post('job-postings')
  async createJobPosting(@Body() postingData: any, @Request() req) {
    return this.recruitmentService.createJobPosting(postingData, req.user.userId);
  }

  @Get('job-postings')
  async findAllJobPostings(@Query() query: any) {
    return this.recruitmentService.findAllJobPostings(query);
  }

  @Patch('job-postings/:id/publish')
  async publishJobPosting(@Param('id') id: string) {
    return this.recruitmentService.publishJobPosting(id);
  }

  // Candidates
  @Post('candidates')
  async createCandidate(@Body() candidateData: any) {
    return this.recruitmentService.createCandidate(candidateData);
  }

  @Get('candidates')
  async findAllCandidates(@Query() query: any) {
    return this.recruitmentService.findAllCandidates(query);
  }

  @Patch('candidates/:id/status')
  async updateCandidateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.recruitmentService.updateCandidateStatus(id, body.status);
  }

  // Job Offers
  @Post('job-offers')
  async createJobOffer(@Body() offerData: any, @Request() req) {
    return this.recruitmentService.createJobOffer(offerData, req.user.userId);
  }

  @Patch('job-offers/:id/accept')
  async acceptOffer(@Param('id') id: string) {
    return this.recruitmentService.acceptOffer(id);
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface JobPosting extends Document {
  [key: string]: any;
}

export interface Candidate extends Document {
  [key: string]: any;
}

export interface JobOffer extends Document {
  [key: string]: any;
}

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel('JobPosting') private jobPostingModel: Model<JobPosting>,
    @InjectModel('Candidate') private candidateModel: Model<Candidate>,
    @InjectModel('JobOffer') private jobOfferModel: Model<JobOffer>,
  ) {}

  // Job Posting methods
  async createJobPosting(postingData: any, userId: string): Promise<JobPosting> {
    const posting = new this.jobPostingModel({
      ...postingData,
      createdBy: userId,
    });
    return posting.save();
  }

  async findAllJobPostings(filters?: any): Promise<JobPosting[]> {
    const query = this.jobPostingModel.find();
    if (filters?.status) {
      query.where('status').equals(filters.status);
    }
    return query.populate('departmentId').populate('positionId').exec();
  }

  async publishJobPosting(id: string): Promise<JobPosting> {
    const posting = await this.jobPostingModel.findByIdAndUpdate(
      id,
      { status: 'published', postedDate: new Date() },
      { new: true },
    ).exec();
    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
    return posting;
  }

  // Candidate methods
  async createCandidate(candidateData: any): Promise<Candidate> {
    const candidate = new this.candidateModel(candidateData);
    return candidate.save();
  }

  async findAllCandidates(filters?: any): Promise<Candidate[]> {
    const query = this.candidateModel.find();
    if (filters?.jobPostingId) {
      query.where('jobPostingId').equals(filters.jobPostingId);
    }
    if (filters?.status) {
      query.where('status').equals(filters.status);
    }
    return query.populate('jobPostingId').exec();
  }

  async updateCandidateStatus(id: string, status: string): Promise<Candidate> {
    const candidate = await this.candidateModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).exec();
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  // Job Offer methods
  async createJobOffer(offerData: any, userId: string): Promise<JobOffer> {
    const offer = new this.jobOfferModel({
      ...offerData,
      createdBy: userId,
    });
    return offer.save();
  }

  async acceptOffer(id: string): Promise<JobOffer> {
    const offer = await this.jobOfferModel.findByIdAndUpdate(
      id,
      { status: 'accepted', acceptedAt: new Date() },
      { new: true },
    ).exec();
    if (!offer) {
      throw new NotFoundException(`Job offer with ID ${id} not found`);
    }
    return offer;
  }
}


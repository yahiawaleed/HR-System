import { api } from './api';

export interface Candidate {
    _id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
    appliedPosition: string;
    resumeUrl?: string;

    // Personal Information
    dateOfBirth?: Date;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    nationalId?: string;

    // Address
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;

    // Application Details
    expectedSalary?: number;
    noticePeriod?: number;
    availabilityDate?: Date;

    // Education
    highestQualification?: string;
    fieldOfStudy?: string;
    institution?: string;
    graduationYear?: number;

    // Experience
    yearsOfExperience?: number;
    currentCompany?: string;
    currentJobTitle?: string;

    // Skills & Additional
    skills?: string[];
    languages?: string[];
    linkedInProfile?: string;
    portfolioWebsite?: string;
    source?: string;
    referredBy?: string;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCandidateData {
    firstName: string;
    lastName: string;
    middleName?: string;
    personalEmail: string;
    nationalId: string;
    dateOfBirth?: string;
    positionId?: string;
}

export interface ConvertCandidateData {
    employeeNumber: string;
    workEmail: string;
    password: string;
    primaryPositionId?: string;
    primaryDepartmentId?: string;
    payGradeId?: string;
}

export interface PaginatedCandidates {
    data: Candidate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const candidatesService = {
    // Create candidate profile
    createCandidate: async (data: CreateCandidateData): Promise<Candidate> => {
        const response = await api.post('/api/employee-profile/candidates', data);
        return response.data;
    },

    // Get all candidates with filters
    getAllCandidates: async (page = 1, limit = 10, search?: string): Promise<PaginatedCandidates> => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        const response = await api.get(`/api/employee-profile/candidates?${params}`);
        return response.data;
    },

    // Get candidate by ID
    getById: async (id: string): Promise<Candidate> => {
        const response = await api.get(`/api/employee-profile/candidates/${id}`);
        return response.data;
    },

    // Convert candidate to employee
    convertToEmployee: async (id: string, data: ConvertCandidateData) => {
        const response = await api.post(`/api/employee-profile/candidates/${id}/convert`, data);
        return response.data;
    },

    // Update candidate status
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/api/employee-profile/candidates/${id}/status`, { status });
        return response.data;
    },
};

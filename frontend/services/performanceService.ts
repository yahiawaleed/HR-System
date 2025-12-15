import { api } from './api';

// --- Interfaces ---

export interface AppraisalTemplate {
    _id: string;
    name: string;
    description?: string;
    sections: TemplateSection[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateSection {
    title: string;
    description?: string;
    weight: number;
    criteria: SectionCriteria[];
}

export interface SectionCriteria {
    name: string;
    description?: string;
    weight: number; // 0-100
    type: 'RATING' | 'TEXT' | 'BOOLEAN';
}

export interface AppraisalCycle {
    _id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AppraisalAssignment {
    _id: string;
    cycleId: AppraisalCycle | string;
    templateId: AppraisalTemplate | string;
    employeeProfileId: any; // EmployeeProfile
    managerProfileId: any; // EmployeeProfile
    departmentId: string;
    positionId?: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'PUBLISHED' | 'ACKNOWLEDGED';
    dueDate?: string;
    submittedAt?: string;
    publishedAt?: string;
    latestAppraisalId?: string;
}

export interface AppraisalRecord {
    _id: string;
    assignmentId: string;
    totalScore: number;
    overallRatingLabel: string;
    sections: RecordSection[];
    managerFeedback?: string;
    managerSubmittedAt?: string;
    hrPublishedAt?: string;
    employeeViewedAt?: string;
    employeeAcknowledgedAt?: string;
    employeeAcknowledgementComment?: string;
    status: 'DRAFT' | 'MANAGER_SUBMITTED' | 'HR_PUBLISHED';
}

export interface RecordSection {
    title: string;
    weight: number;
    score: number;
    criteria: RecordCriteria[];
}

export interface RecordCriteria {
    name: string;
    weight: number;
    score: number;
    managerRating?: number;
    managerComment?: string;
}

// --- DTOs ---

export interface CreateTemplateData {
    name: string;
    description?: string;
    templateType: string;
    ratingScale: {
        type: string;
        min: number;
        max: number;
        labels?: string[];
    };
    sections: TemplateSection[];
}

export interface CreateCycleData {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
}

export interface AssignAppraisalData {
    cycleId: string;
    templateId: string;
    employeeProfileId: string;
    managerProfileId: string;
    departmentId: string;
    positionId?: string;
    dueDate?: string;
}

export interface SubmitFeedbackData {
    sections: {
        title: string;
        criteria: {
            name: string;
            managerRating: number;
            managerComment?: string;
        }[];
    }[];
    managerFeedback?: string;
}

export interface SelfAssessmentData {
    strengths: string;
    weaknesses: string;
    achievements: string;
    goals: string;
}

// --- Service ---

export const performanceService = {
    // --- Templates ---
    createTemplate: async (data: CreateTemplateData): Promise<AppraisalTemplate> => {
        const response = await api.post('/performance/templates', data);
        return response.data;
    },

    getAllTemplates: async (): Promise<AppraisalTemplate[]> => {
        const response = await api.get('/performance/templates');
        return response.data;
    },

    getTemplateById: async (id: string): Promise<AppraisalTemplate> => {
        const response = await api.get(`/performance/templates/${id}`);
        return response.data;
    },

    updateTemplate: async (id: string, data: Partial<CreateTemplateData>): Promise<AppraisalTemplate> => {
        const response = await api.patch(`/performance/templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: string): Promise<AppraisalTemplate> => {
        const response = await api.delete(`/performance/templates/${id}`);
        return response.data;
    },

    // --- Cycles ---
    createCycle: async (data: CreateCycleData): Promise<AppraisalCycle> => {
        const response = await api.post('/performance/cycles', data);
        return response.data;
    },

    getAllCycles: async (): Promise<AppraisalCycle[]> => {
        const response = await api.get('/performance/cycles');
        return response.data;
    },

    getCycleById: async (id: string): Promise<AppraisalCycle> => {
        const response = await api.get(`/performance/cycles/${id}`);
        return response.data;
    },

    updateCycle: async (id: string, data: Partial<CreateCycleData>): Promise<AppraisalCycle> => {
        const response = await api.patch(`/performance/cycles/${id}`, data);
        return response.data;
    },

    // --- Appraisals ---
    assignAppraisal: async (data: AssignAppraisalData): Promise<AppraisalAssignment> => {
        const response = await api.post('/performance/appraisals', data);
        return response.data;
    },

    bulkAssignAppraisals: async (data: any): Promise<AppraisalAssignment[]> => {
        const response = await api.post('/performance/appraisals/bulk-assign', data);
        return response.data;
    },

    bulkPublishAppraisals: async (data: { assignmentIds: string[] }, publishedBy: string): Promise<any[]> => {
        const response = await api.post(`/performance/appraisals/bulk-publish?publishedBy=${publishedBy}`, data);
        return response.data;
    },

    getMyAppraisals: async (employeeId: string): Promise<AppraisalAssignment[]> => {
        const response = await api.get(`/performance/appraisals/my-appraisals?employeeId=${employeeId}`);
        return response.data;
    },

    getMyPublishedAppraisals: async (employeeId: string): Promise<AppraisalAssignment[]> => {
        const response = await api.get(`/performance/appraisals/my-appraisals/published?employeeId=${employeeId}`);
        return response.data;
    },

    getMyTeamAppraisals: async (managerId: string): Promise<AppraisalAssignment[]> => {
        const response = await api.get(`/performance/appraisals/my-team?managerId=${managerId}`);
        return response.data;
    },

    getAppraisalByAssignmentId: async (id: string): Promise<{ assignment: AppraisalAssignment; record: AppraisalRecord }> => {
        const response = await api.get(`/performance/appraisals/${id}`);
        return response.data;
    },

    submitManagerFeedback: async (id: string, data: SubmitFeedbackData): Promise<AppraisalRecord> => {
        const response = await api.post(`/performance/appraisals/${id}/feedback`, data);
        return response.data;
    },

    submitSelfAssessment: async (id: string, data: SelfAssessmentData): Promise<any> => {
        const response = await api.post(`/performance/appraisals/${id}/self-assessment`, data);
        return response.data;
    },

    finalizeAppraisal: async (id: string, publishedBy: string): Promise<AppraisalRecord> => {
        const response = await api.patch(`/performance/appraisals/${id}/finalize`, { publishedBy });
        return response.data;
    },

    markAsViewed: async (id: string): Promise<AppraisalRecord> => {
        const response = await api.post(`/performance/appraisals/${id}/view`);
        return response.data;
    },

    acknowledgeAppraisal: async (id: string, comment?: string): Promise<AppraisalRecord> => {
        const response = await api.post(`/performance/appraisals/${id}/acknowledge`, { comment });
        return response.data;
    },

    // --- Disputes ---
    raiseDispute: async (id: string, employeeId: string, data: { reason: string; description: string }): Promise<any> => {
        const response = await api.post(`/performance/appraisals/${id}/dispute?employeeId=${employeeId}`, data);
        return response.data;
    },

    resolveDispute: async (id: string, resolverId: string, data: { resolutionSummary: string; status: string }): Promise<any> => {
        const response = await api.patch(`/performance/disputes/${id}/resolve?resolverId=${resolverId}`, data);
        return response.data;
    },

    getAllDisputes: async (): Promise<any[]> => {
        const response = await api.get('/performance/disputes');
        return response.data;
    },

    getDisputeById: async (id: string): Promise<any> => {
        const response = await api.get(`/performance/disputes/${id}`);
        return response.data;
    },

    // --- Dashboard ---
    getPendingAppraisals: async (): Promise<AppraisalAssignment[]> => {
        const response = await api.get('/performance/dashboard/pending');
        return response.data;
    },

    getAppraisalProgress: async (): Promise<any> => {
        const response = await api.get('/performance/dashboard/progress');
        return response.data;
    },

    // --- History ---
    getMyHistory: async (employeeId: string): Promise<any> => {
        const response = await api.get(`/performance/history/my-history?employeeId=${employeeId}`);
        return response.data;
    },

    getEmployeeHistory: async (employeeId: string): Promise<any> => {
        const response = await api.get(`/performance/history/${employeeId}`);
        return response.data;
    },

    // --- Reports ---
    getCycleReport: async (cycleId: string): Promise<any> => {
        const response = await api.get(`/performance/reports/cycle/${cycleId}`);
        return response.data;
    },
};

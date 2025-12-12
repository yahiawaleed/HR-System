import api from '../lib/api';

export interface Application {
    _id: string;
    requisitionId: {
        _id: string;
        title: string;
    } | string;
    candidateId: string; // or object if populated
    resumeUrl?: string;
    status: string;
    currentStage: string;
    submittedAt: string;
    assignedHr?: string;
}

export interface CreateApplicationDto {
    requisitionId: string;
    candidateId: string;
    resumeUrl?: string;
    assignedHr?: string;
    // status and currentStage usually have defaults
}

export const ApplicationsService = {
    async findAll() {
        const response = await api.get<Application[]>('/recruitment/applications');
        return response.data;
    },

    async create(data: CreateApplicationDto) {
        const response = await api.post<Application>('/recruitment/applications', data);
        return response.data;
    },

    async updateStatus(id: string, status: string) {
        const response = await api.patch<Application>(`/recruitment/applications/${id}/status`, { status });
        return response.data;
    }
};

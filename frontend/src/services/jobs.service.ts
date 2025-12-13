import api from '../lib/api';

export interface Job {
    _id: string;
    title: string;
    department: string;
    status: string;
    description: string;
    qualifications: string[];
    skills: string[];
}

export interface CreateJobDto {
    title: string;
    department: string;
    description: string;
    qualifications: string[]; // or string if parsing manually
    skills: string[];       // or string if parsing manually
}

export const JobsService = {
    async findAll() {
        const response = await api.get<Job[]>('/recruitment/jobs');
        return response.data;
    },

    async create(data: CreateJobDto) {
        const response = await api.post<Job>('/recruitment/jobs', data);
        return response.data;
    },

    async findById(id: string) {
        const response = await api.get<Job>(`/recruitment/jobs/${id}`);
        return response.data;
    },

    async delete(id: string) {
        await api.delete(`/recruitment/jobs/${id}`);
    }
};

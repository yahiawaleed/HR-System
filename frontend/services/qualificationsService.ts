import { api } from './api';

export interface Qualification {
    _id: string;
    establishmentName: string;
    graduationType: string;
    employeeProfileId: string;
}

export interface CreateQualificationData {
    establishmentName: string;
    graduationType: string;
}

export const qualificationsService = {
    // Get all qualifications for an employee
    getQualifications: async (employeeId: string): Promise<Qualification[]> => {
        const response = await api.get(`/api/employee-profile/${employeeId}/qualifications`);
        return response.data;
    },

    // Add a qualification to an employee
    addQualification: async (employeeId: string, data: CreateQualificationData): Promise<Qualification> => {
        const response = await api.post(`/api/employee-profile/${employeeId}/qualifications`, data);
        return response.data;
    },
};

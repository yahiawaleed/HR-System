import { api } from './api';

export interface EmployeeProfile {
    _id: string;
    workEmail: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    fullName: string;
    employeeNumber: string;
    nationalId: string;
    dateOfBirth: Date;
    dateOfHire: Date;
    gender?: string;
    maritalStatus?: string;
    mobilePhone?: string;
    homePhone?: string;
    personalEmail?: string;
    status: string;
    contractType?: string;
    workType?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    bankName?: string;
    bankAccountNumber?: string;
    biography?: string;
    profilePictureUrl?: string;
}

export interface CreateEmployeeData {
    workEmail: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    employeeNumber: string;
    nationalId: string;
    dateOfBirth: string;
    dateOfHire: string;
    gender?: string;
    maritalStatus?: string;
    mobilePhone?: string;
    personalEmail?: string;
    contractType?: string;
    workType?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    status?: string; // Employee status (ACTIVE, INACTIVE, etc.)
}

export const employeeService = {
    // Get all employees with pagination
    getAll: async (page = 1, limit = 10, search?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        const response = await api.get(`/api/employee-profile?${params}`);
        return response.data;
    },

    // Get employee by ID
    getById: async (id: string): Promise<EmployeeProfile> => {
        const response = await api.get(`/api/employee-profile/${id}`);
        return response.data;
    },

    // Create employee
    create: async (data: CreateEmployeeData): Promise<EmployeeProfile> => {
        const response = await api.post('/api/employee-profile', data);
        return response.data;
    },

    // Update employee
    update: async (id: string, data: Partial<CreateEmployeeData>): Promise<EmployeeProfile> => {
        const response = await api.patch(`/api/employee-profile/${id}`, data);
        return response.data;
    },

    // Deactivate employee
    deactivate: async (id: string, status: string): Promise<EmployeeProfile> => {
        const response = await api.delete(`/api/employee-profile/${id}`, {
            data: { status },
        });
        return response.data;
    },

    // Change requests
    createChangeRequest: async (data: { requestDescription: string; reason?: string }) => {
        const response = await api.post('/api/employee-profile/change-requests', data);
        return response.data;
    },

    getAllChangeRequests: async (page = 1, limit = 10) => {
        const response = await api.get(`/api/employee-profile/change-requests?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Export employee profile to PDF
    exportPDF: async (id: string) => {
        const response = await api.get(`/api/employee-profile/${id}/pdf`, {
            responseType: 'blob',
        });
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `employee-profile-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    // Update contact info directly (BR 2n, 2o, 2g)
    updateContactInfo: async (id: string, data: {
        mobilePhone?: string;
        homePhone?: string;
        personalEmail?: string;
        address?: string;
    }): Promise<EmployeeProfile> => {
        const response = await api.patch(`/api/employee-profile/${id}/contact`, data);
        return response.data;
    },

    // Upload profile picture
    uploadProfilePicture: async (id: string, file: File): Promise<EmployeeProfile> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/api/employee-profile/${id}/picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

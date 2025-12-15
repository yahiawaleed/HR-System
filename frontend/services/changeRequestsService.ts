import { api } from './api';

export interface ChangeRequest {
    _id: string;
    requestId: string;
    employeeProfileId: {
        _id: string;
        fullName: string;
        employeeNumber: string;
    } | string;
    requestDescription: string;
    reason?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedChangeRequests {
    data: ChangeRequest[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export const changeRequestsService = {
    // Get all change requests
    getAllChangeRequests: async (page = 1, limit = 10, status?: string): Promise<PaginatedChangeRequests> => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        const response = await api.get(`/api/employee-profile/change-requests?${params}`);
        return response.data;
    },

    // Get single change request
    getChangeRequestById: async (id: string): Promise<ChangeRequest> => {
        const response = await api.get(`/api/employee-profile/change-requests/${id}`);
        return response.data;
    },

    // Approve a change request
    approveChangeRequest: async (id: string): Promise<ChangeRequest> => {
        const response = await api.patch(`/api/employee-profile/change-requests/${id}/approve`);
        return response.data;
    },

    // Reject a change request
    rejectChangeRequest: async (id: string): Promise<ChangeRequest> => {
        const response = await api.patch(`/api/employee-profile/change-requests/${id}/reject`);
        return response.data;
    },

    // --- Organization Structure Change Requests ---

    // Create org change request
    createOrgChangeRequest: async (data: any): Promise<any> => {
        const response = await api.post('/api/organization-structure/change-requests', data);
        return response.data;
    },

    // Get all org change requests
    getAllOrgChangeRequests: async (page = 1, limit = 10, status?: string): Promise<PaginatedChangeRequests> => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        const response = await api.get(`/api/organization-structure/change-requests?${params}`);
        return response.data;
    },

    // Approve org change request
    approveOrgChangeRequest: async (id: string): Promise<any> => {
        const response = await api.patch(`/api/organization-structure/change-requests/${id}/approve`);
        return response.data;
    },

    // Reject org change request
    rejectOrgChangeRequest: async (id: string): Promise<any> => {
        const response = await api.patch(`/api/organization-structure/change-requests/${id}/reject`);
        return response.data;
    },
};

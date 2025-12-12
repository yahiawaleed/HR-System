import { api } from './api';

// ============ INTERFACES ============

export interface Department {
    _id: string;
    code: string;
    name: string;
    description?: string;
    headPositionId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateDepartmentData {
    code: string;
    name: string;
    description?: string;
    headPositionId?: string;
    isActive?: boolean;
}

export interface UpdateDepartmentData {
    code?: string;
    name?: string;
    description?: string;
    headPositionId?: string;
    isActive?: boolean;
}

export interface Position {
    _id: string;
    code: string;
    title: string;
    description?: string;
    departmentId: string;
    reportsToPositionId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePositionData {
    code: string;
    title: string;
    description?: string;
    departmentId: string;
    reportsToPositionId?: string;
    isActive?: boolean;
}

export interface UpdatePositionData {
    code?: string;
    title?: string;
    description?: string;
    departmentId?: string;
    reportsToPositionId?: string;
    isActive?: boolean;
}

export interface ChangeRequest {
    _id: string;
    requestNumber: string;
    requestedByEmployeeId: string;
    requestType: string;
    targetDepartmentId?: string;
    targetPositionId?: string;
    details?: string;
    reason?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateChangeRequestData {
    requestNumber: string;
    requestedByEmployeeId: string;
    requestType: string;
    targetDepartmentId?: string;
    targetPositionId?: string;
    details?: string;
    reason?: string;
}

export interface AssignPositionData {
    employeeProfileId: string;
    positionId: string;
    startDate: Date;
    reason?: string;
    notes?: string;
}

export interface PositionAssignment {
    _id: string;
    employeeProfileId: string;
    positionId: string;
    departmentId: string;
    startDate: Date;
    endDate?: Date;
    reason?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============ DEPARTMENTS SERVICE ============

export const departmentsService = {
    // Get all departments
    getAll: async (): Promise<Department[]> => {
        const response = await api.get('/api/organization-structure/departments');
        return response.data;
    },

    // Get department by ID
    getById: async (id: string): Promise<Department> => {
        const response = await api.get(`/api/organization-structure/departments/${id}`);
        return response.data;
    },

    // Create new department
    create: async (data: CreateDepartmentData): Promise<Department> => {
        const response = await api.post('/api/organization-structure/departments', data);
        return response.data;
    },

    // Update department
    update: async (id: string, data: UpdateDepartmentData): Promise<Department> => {
        const response = await api.patch(`/api/organization-structure/departments/${id}`, data);
        return response.data;
    },

    // Delete department
    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/api/organization-structure/departments/${id}`);
        return response.data;
    },

    // Activate department
    activate: async (id: string): Promise<Department> => {
        const response = await api.patch(`/api/organization-structure/departments/${id}/activate`);
        return response.data;
    },

    // Deactivate department
    deactivate: async (id: string): Promise<Department> => {
        const response = await api.patch(`/api/organization-structure/departments/${id}/deactivate`);
        return response.data;
    },

    // Get positions in department
    getPositions: async (id: string): Promise<Position[]> => {
        const response = await api.get(`/api/organization-structure/departments/${id}/positions`);
        return response.data;
    },
};

// ============ POSITIONS SERVICE ============

export const positionsService = {
    // Get all positions
    getAll: async (): Promise<Position[]> => {
        const response = await api.get('/api/organization-structure/positions');
        return response.data;
    },

    // Get position by ID
    getById: async (id: string): Promise<Position> => {
        const response = await api.get(`/api/organization-structure/positions/${id}`);
        return response.data;
    },

    // Create new position
    create: async (data: CreatePositionData): Promise<Position> => {
        const response = await api.post('/api/organization-structure/positions', data);
        return response.data;
    },

    // Update position
    update: async (id: string, data: UpdatePositionData): Promise<Position> => {
        const response = await api.patch(`/api/organization-structure/positions/${id}`, data);
        return response.data;
    },

    // Delete position
    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/api/organization-structure/positions/${id}`);
        return response.data;
    },

    // Activate position
    activate: async (id: string): Promise<Position> => {
        const response = await api.patch(`/api/organization-structure/positions/${id}/activate`);
        return response.data;
    },

    // Deactivate position
    deactivate: async (id: string): Promise<Position> => {
        const response = await api.patch(`/api/organization-structure/positions/${id}/deactivate`);
        return response.data;
    },

    // Get current assignee
    getAssignee: async (id: string): Promise<any> => {
        const response = await api.get(`/api/organization-structure/positions/${id}/assignee`);
        return response.data;
    },
};

// ============ HIERARCHY SERVICE ============

export const hierarchyService = {
    // Get full organization hierarchy
    getFull: async (): Promise<any> => {
        const response = await api.get('/api/organization-structure/hierarchy');
        return response.data;
    },

    // Get department hierarchy
    getDepartment: async (id: string): Promise<any> => {
        const response = await api.get(`/api/organization-structure/hierarchy/department/${id}`);
        return response.data;
    },
};

// ============ CHANGE REQUESTS SERVICE ============

export const changeRequestsService = {
    // Get all change requests
    getAll: async (): Promise<ChangeRequest[]> => {
        const response = await api.get('/api/organization-structure/change-requests');
        return response.data;
    },

    // Create new change request
    create: async (data: CreateChangeRequestData): Promise<ChangeRequest> => {
        const response = await api.post('/api/organization-structure/change-requests', data);
        return response.data;
    },

    // Approve change request
    approve: async (id: string): Promise<ChangeRequest> => {
        const response = await api.patch(`/api/organization-structure/change-requests/${id}/approve`);
        return response.data;
    },

    // Reject change request
    reject: async (id: string): Promise<ChangeRequest> => {
        const response = await api.patch(`/api/organization-structure/change-requests/${id}/reject`);
        return response.data;
    },
};

// ============ ASSIGNMENTS SERVICE ============

export const assignmentsService = {
    // Assign position to employee
    assign: async (data: AssignPositionData): Promise<PositionAssignment> => {
        const response = await api.post('/api/organization-structure/assignments', data);
        return response.data;
    },
};

export const teamService = {
    getMyTeam: async (): Promise<any[]> => {
        const response = await api.get('/api/organization-structure/my-team');
        return response.data;
    },
};

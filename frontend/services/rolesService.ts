import { api } from './api';

export interface EmployeeRole {
    _id: string;
    employee: string;
    roles: string[];
    isActive: boolean;
    assignedBy: string;
    assignedAt: Date;
}

export interface AssignRolesData {
    roles: string[];
}

export const rolesService = {
    // Assign system roles to employee
    assignRoles: async (employeeId: string, roles: string[]): Promise<EmployeeRole> => {
        const response = await api.post(`/api/employee-profile/${employeeId}/roles`, { roles });
        return response.data;
    },

    // Get employee roles
    getEmployeeRoles: async (employeeId: string): Promise<EmployeeRole> => {
        const response = await api.get(`/api/employee-profile/${employeeId}/roles`);
        return response.data;
    },

    // Update employee roles
    updateRoles: async (employeeId: string, roles: string[]): Promise<EmployeeRole> => {
        const response = await api.patch(`/api/employee-profile/${employeeId}/roles`, { roles });
        return response.data;
    },

    // Deactivate employee roles
    deactivateRoles: async (employeeId: string): Promise<EmployeeRole> => {
        const response = await api.patch(`/api/employee-profile/${employeeId}/roles/deactivate`);
        return response.data;
    },
};

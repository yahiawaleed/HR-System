import api from '../lib/api';

export interface Employee {
    _id: string;
    employeeNumber: string;
    firstName?: string; // Schema uses extend UserProfileBase? Need to check structure.
    lastName?: string;
    // Assuming structure based on UserProfileBase or whatever returns
    // In schema: extends UserProfileBase. UserProfileBase usually has firstName, lastName.
    // Let's assume the response has these.
    // If not, we map what we get.
    // We can also see `candidateId` if we are using Onboarding dummy.
    // BUT we are using EmployeeProfile now.

    // Let's add generic fields to be safe
    [key: string]: any;
}

export const EmployeesService = {
    async findAll() {
        // We added findAllEmployees to RecruitmentController which calls RecruitmentService.findAllEmployees
        // Endpoint: /recruitment/employees
        const response = await api.get<Employee[]>('/recruitment/employees');
        return response.data;
    },

    async delete(id: string) {
        await api.delete(`/recruitment/employees/${id}`);
    }
};

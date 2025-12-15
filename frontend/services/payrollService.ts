import { api } from './api';

export interface PayrollRun {
    _id: string;
    periodStart: string;
    periodEnd: string;
    status: string;
}

export const payrollService = {
    initiatePayroll: async (periodStart: Date, periodEnd: Date) => {
        const response = await api.post('/payroll-processing/initiate', {
            periodStart,
            periodEnd,
        });
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/payroll-processing'); // Note: Backend controller needs to implement this properly
        return response.data;
    },

    // Configuration
    getPayGrades: async () => {
        const response = await api.get('/payroll-config/pay-grades');
        return response.data;
    },

    getTaxRules: async () => {
        const response = await api.get('/payroll-config/tax-rules');
        return response.data;
    },

    // Tracking/Reports
    getPayslips: async () => {
        const response = await api.get('/payroll-tracking/payslips');
        return response.data;
    },

    // Claims
    getClaims: async () => {
        const response = await api.get('/payroll-tracking/claims');
        return response.data;
    },

    createClaim: async (data: any) => {
        // data: { type, amount, description, attachments? }
        const response = await api.post('/payroll-tracking/claims', data); // Endpoint needs to be created in backend
        return response.data;
    },

    // Disputes
    getDisputes: async () => {
        const response = await api.get('/payroll-tracking/disputes');
        return response.data;
    },

    createDispute: async (data: any) => {
        // data: { payrollId, reason }
        const response = await api.post('/payroll-tracking/disputes', data); // Endpoint needs to be created in backend
        return response.data;
    },
};

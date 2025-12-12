import { api } from './api';

export interface UserProfile {
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

export const profileService = {
    // Get current user's profile (no ID needed - uses JWT token)
    getMyProfile: async (): Promise<UserProfile> => {
        const response = await api.get('/api/employee-profile/profile');
        return response.data;
    },

    // Create change request for critical fields
    createChangeRequest: async (data: { requestDescription: string; reason?: string }) => {
        const response = await api.post('/api/employee-profile/change-requests', data);
        return response.data;
    },
};

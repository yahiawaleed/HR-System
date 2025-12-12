import api from '../lib/api';

export interface Offer {
    _id: string;
    applicationId: string;
    candidateId: string;
    grossSalary: number;
    signingBonus?: number;
    benefits?: string[];
    content: string; // "details" in prompt, "content" in schema
    role: string;
    finalStatus: string;
    applicantResponse: string;
    deadline?: string;
    createdAt: string;
}

export interface CreateOfferDto {
    applicationId: string;
    candidateId: string;
    grossSalary: number;
    signingBonus?: number;
    benefits?: string[];
    content: string;
    role: string;
    deadline?: Date;
}

export const OffersService = {
    async findAll() {
        const response = await api.get<Offer[]>('/recruitment/offers');
        return response.data;
    },

    async create(data: CreateOfferDto) {
        const response = await api.post<Offer>('/recruitment/offers', data);
        return response.data;
    },

    async accept(id: string) {
        const response = await api.post<Offer>(`/recruitment/offers/${id}/accept`);
        return response.data;
    }
};

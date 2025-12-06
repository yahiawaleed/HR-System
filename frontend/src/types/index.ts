export interface Job {
    _id: string;
    requisitionId: string;
    openings: number;
    location: string;
    publishStatus: 'draft' | 'published' | 'closed';
    hiringManagerId: string;
}

export interface Application {
    _id: string;
    status: string;
    candidateId: string;
    requisitionId: string;
}

export interface JobFormData {
    requisitionId: string;
    openings: number;
    location: string;
    hiringManagerId: string;
}

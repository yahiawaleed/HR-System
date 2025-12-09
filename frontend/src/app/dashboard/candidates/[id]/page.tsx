'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { candidatesService } from '@/services/candidatesService';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function CandidateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const candidateId = params.id as string;

    const { data: candidate, isLoading } = useQuery({
        queryKey: ['candidate', candidateId],
        queryFn: () => candidatesService.getById(candidateId),
        enabled: !!candidateId,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!candidate) {
        return (
            <Box>
                <Typography variant="h6">Candidate not found</Typography>
                <Button component={Link} href="/dashboard/candidates">
                    Back to Candidates
                </Button>
            </Box>
        );
    }

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: any } = {
            APPLIED: 'info',
            SCREENING: 'warning',
            INTERVIEW: 'primary',
            OFFER_SENT: 'success',
            OFFER_ACCEPTED: 'success',
            HIRED: 'success',
            REJECTED: 'error',
            WITHDRAWN: 'default',
        };
        return colors[status] || 'default';
    };

    const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
        <Box mb={2}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1">{value || 'N/A'}</Typography>
        </Box>
    );

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center">
                    <Button
                        component={Link}
                        href="/dashboard/candidates"
                        startIcon={<ArrowBack />}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4">{candidate.fullName}</Typography>
                </Box>
                <Chip
                    label={candidate.status}
                    color={getStatusColor(candidate.status)}
                    size="medium"
                />
            </Box>

            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Personal Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <InfoRow label="Full Name" value={candidate.fullName} />
                        <InfoRow label="Email" value={candidate.email} />
                        <InfoRow label="Phone" value={candidate.phone} />
                        <InfoRow label="Date of Birth" value={candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString() : undefined} />
                        <InfoRow label="Gender" value={candidate.gender} />
                        <InfoRow label="Marital Status" value={candidate.maritalStatus} />
                        <InfoRow label="Nationality" value={candidate.nationality} />
                        <InfoRow label="National ID" value={candidate.nationalId} />
                    </Paper>
                </Grid>

                {/* Contact Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Contact & Address
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <InfoRow label="Address" value={candidate.address} />
                        <InfoRow label="City" value={candidate.city} />
                        <InfoRow label="State/Province" value={candidate.state} />
                        <InfoRow label="Postal Code" value={candidate.postalCode} />
                        <InfoRow label="Country" value={candidate.country} />
                    </Paper>
                </Grid>

                {/* Application Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Application Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <InfoRow label="Applied Position" value={candidate.appliedPosition} />
                        <InfoRow label="Expected Salary" value={candidate.expectedSalary?.toString()} />
                        <InfoRow label="Notice Period (Days)" value={candidate.noticePeriod?.toString()} />
                        <InfoRow label="Availability Date" value={candidate.availabilityDate ? new Date(candidate.availabilityDate).toLocaleDateString() : undefined} />
                        <InfoRow label="Applied Date" value={new Date(candidate.createdAt).toLocaleDateString()} />
                    </Paper>
                </Grid>

                {/* Education & Experience */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Education & Experience
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <InfoRow label="Highest Qualification" value={candidate.highestQualification} />
                        <InfoRow label="Field of Study" value={candidate.fieldOfStudy} />
                        <InfoRow label="Institution/University" value={candidate.institution} />
                        <InfoRow label="Graduation Year" value={candidate.graduationYear?.toString()} />
                        <InfoRow label="Years of Experience" value={candidate.yearsOfExperience?.toString()} />
                        <InfoRow label="Current Company" value={candidate.currentCompany} />
                        <InfoRow label="Current Job Title" value={candidate.currentJobTitle} />
                    </Paper>
                </Grid>

                {/* Skills & Additional Info */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Skills & Additional Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Skills</Typography>
                            <Box mt={1}>
                                {(candidate.skills?.length ?? 0) > 0 ? (
                                    (candidate.skills ?? []).map((skill: string, index: number) => (
                                        <Chip key={index} label={skill} size="small" sx={{ mr: 1, mb: 1 }} />
                                    ))
                                ) : (
                                    <Typography variant="body2">No skills listed</Typography>
                                )}
                            </Box>
                        </Box>
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Languages</Typography>
                            <Box mt={1}>
                                {(candidate.languages?.length ?? 0) > 0 ? (
                                    (candidate.languages ?? []).map((lang: string, index: number) => (
                                        <Chip key={index} label={lang} size="small" color="primary" sx={{ mr: 1, mb: 1 }} />
                                    ))
                                ) : (
                                    <Typography variant="body2">No languages listed</Typography>
                                )}
                            </Box>
                        </Box>
                        <InfoRow label="LinkedIn Profile" value={candidate.linkedInProfile} />
                        <InfoRow label="Portfolio/Website" value={candidate.portfolioWebsite} />
                        <InfoRow label="Source" value={candidate.source} />
                        <InfoRow label="Referred By" value={candidate.referredBy} />
                        {candidate.notes && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Notes</Typography>
                                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                                    <Typography variant="body2">{candidate.notes}</Typography>
                                </Paper>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

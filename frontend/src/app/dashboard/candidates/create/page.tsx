'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { candidatesService, CreateCandidateData } from '@/services/candidatesService';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function CreateCandidatePage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateCandidateData>({
        firstName: '',
        lastName: '',
        middleName: '',
        personalEmail: '',
        nationalId: '',
        dateOfBirth: '',
        positionId: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateCandidateData) => candidatesService.createCandidate(data),
        onSuccess: () => {
            router.push('/dashboard/candidates');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create candidate');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        createMutation.mutate(formData);
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href="/dashboard/candidates"
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Add New Candidate</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Middle Name"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="email"
                                label="Personal Email"
                                name="personalEmail"
                                value={formData.personalEmail}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="National ID"
                                name="nationalId"
                                value={formData.nationalId}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date of Birth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Position ID"
                                name="positionId"
                                value={formData.positionId}
                                onChange={handleChange}
                                helperText="Optional: Job position they applied for"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                                <Button
                                    component={Link}
                                    href="/dashboard/candidates"
                                    variant="outlined"
                                    disabled={createMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Candidate'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

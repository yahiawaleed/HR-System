'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { performanceService, CreateCycleData } from '@/services/performanceService';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function CreateCyclePage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateCycleData>({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
    });

    const createMutation = useMutation({
        mutationFn: performanceService.createCycle,
        onSuccess: () => {
            router.push('/dashboard/performance/cycles');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create cycle');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.startDate || !formData.endDate) {
            setError('Please fill in all required fields');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('Start date cannot be after end date');
            return;
        }

        createMutation.mutate(formData);
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href="/dashboard/performance/cycles"
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Create Appraisal Cycle</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                required
                                label="Cycle Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Q4 2023 Performance Review"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Cycle Type"
                                name="cycleType"
                                value={formData.cycleType || ''}
                                onChange={handleChange}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="" disabled>Select Cycle Type</option>
                                <option value="ANNUAL">Annual</option>
                                <option value="SEMI_ANNUAL">Semi-Annual</option>
                                <option value="PROBATIONARY">Probationary</option>
                                <option value="PROJECT">Project</option>
                                <option value="AD_HOC">Ad-Hoc</option>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Start Date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="End Date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<Save />}
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Cycle'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

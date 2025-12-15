'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService, CreateCycleData } from '@/services/performanceService';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function EditCyclePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateCycleData>({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
    });

    const { data: cycle, isLoading } = useQuery({
        queryKey: ['cycle', id],
        queryFn: () => performanceService.getCycleById(id),
    });

    useEffect(() => {
        if (cycle) {
            setFormData({
                name: cycle.name,
                description: cycle.description || '',
                startDate: cycle.startDate.split('T')[0], // Format for date input
                endDate: cycle.endDate.split('T')[0],
            });
        }
    }, [cycle]);

    const updateMutation = useMutation({
        mutationFn: (data: CreateCycleData) => performanceService.updateCycle(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cycles'] });
            queryClient.invalidateQueries({ queryKey: ['cycle', id] });
            alert('Cycle updated successfully!');
            router.push('/dashboard/performance/cycles');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update cycle');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            setError('End date must be after start date');
            return;
        }

        updateMutation.mutate(formData);
    };

    if (isLoading) return <CircularProgress />;

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
                <Typography variant="h4">Edit Cycle</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                required
                                label="Cycle Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Q1 2024 Performance Review"
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
                    </Grid>

                    <Box display="flex" justifyContent="flex-end" mt={4}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Paper>
            </form>
        </Box>
    );
}

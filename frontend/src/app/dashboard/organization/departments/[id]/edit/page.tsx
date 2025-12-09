'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { departmentsService, positionsService, UpdateDepartmentData } from '@/services/organizationServices';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    MenuItem,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function EditDepartmentPage() {
    const router = useRouter();
    const params = useParams();
    const departmentId = params.id as string;
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<UpdateDepartmentData>({
        code: '',
        name: '',
        description: '',
        headPositionId: '',
        isActive: true,
    });

    const { data: department, isLoading } = useQuery({
        queryKey: ['department', departmentId],
        queryFn: () => departmentsService.getById(departmentId),
        enabled: !!departmentId,
    });

    const { data: positions } = useQuery({
        queryKey: ['positions'],
        queryFn: () => positionsService.getAll(),
    });

    useEffect(() => {
        if (department) {
            setFormData({
                code: department.code,
                name: department.name,
                description: department.description || '',
                headPositionId: department.headPositionId || '',
                isActive: department.isActive,
            });
        }
    }, [department]);

    const updateMutation = useMutation({
        mutationFn: (data: UpdateDepartmentData) => departmentsService.update(departmentId, data),
        onSuccess: () => {
            router.push('/dashboard/organization/departments');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update department');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanedData = { ...formData };
        if (!cleanedData.description) delete cleanedData.description;
        if (!cleanedData.headPositionId) delete cleanedData.headPositionId;

        updateMutation.mutate(cleanedData);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href={`/dashboard/organization/departments/${departmentId}`}
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Edit Department</Typography>
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
                                label="Department Code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Department Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
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
                                select
                                label="Head Position (Optional)"
                                name="headPositionId"
                                value={formData.headPositionId || ''}
                                onChange={handleChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {positions?.map((position) => (
                                    <MenuItem key={position._id} value={position._id}>
                                        {position.title} ({position.code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        name="isActive"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" gap={2} justifyContent="flex-end">
                                <Button
                                    component={Link}
                                    href={`/dashboard/organization/departments/${departmentId}`}
                                    variant="outlined"
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={updateMutation.isPending}
                                    startIcon={updateMutation.isPending && <CircularProgress size={20} />}
                                >
                                    {updateMutation.isPending ? 'Updating...' : 'Update Department'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

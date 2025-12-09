'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { employeeService, CreateEmployeeData } from '@/services/employeeService';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<Partial<CreateEmployeeData>>({
        firstName: '',
        lastName: '',
        middleName: '',
        employeeNumber: '',
        nationalId: '',
        dateOfBirth: '',
        dateOfHire: '',
        gender: '',
        maritalStatus: '',
        mobilePhone: '',
        personalEmail: '',
        contractType: '',
        workType: '',
        contractStartDate: '',
        contractEndDate: '',
    });

    const { data: employee, isLoading } = useQuery({
        queryKey: ['employee', employeeId],
        queryFn: () => employeeService.getById(employeeId),
        enabled: !!employeeId,
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                middleName: employee.middleName || '',
                employeeNumber: employee.employeeNumber || '',
                nationalId: employee.nationalId || '',
                dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
                dateOfHire: employee.dateOfHire ? new Date(employee.dateOfHire).toISOString().split('T')[0] : '',
                gender: employee.gender || '',
                maritalStatus: employee.maritalStatus || '',
                mobilePhone: employee.mobilePhone || '',
                personalEmail: employee.personalEmail || '',
                contractType: employee.contractType || '',
                workType: employee.workType || '',
                contractStartDate: employee.contractStartDate ? new Date(employee.contractStartDate).toISOString().split('T')[0] : '',
                contractEndDate: employee.contractEndDate ? new Date(employee.contractEndDate).toISOString().split('T')[0] : '',
            });
        }
    }, [employee]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateEmployeeData>) => employeeService.update(employeeId, data),
        onSuccess: () => {
            router.push('/dashboard/employees');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update employee');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Remove empty string dates and send undefined instead
        const cleanedData = { ...formData };
        if (!cleanedData.contractEndDate || cleanedData.contractEndDate === '') {
            delete cleanedData.contractEndDate;
        }
        if (!cleanedData.contractStartDate || cleanedData.contractStartDate === '') {
            delete cleanedData.contractStartDate;
        }

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
                    href="/dashboard/employees"
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Edit Employee</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Personal Information */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom>
                                Personal Information
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                required
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Middle Name"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
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
                                required
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
                                select
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Marital Status"
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleChange}
                            >
                                <MenuItem value="SINGLE">Single</MenuItem>
                                <MenuItem value="MARRIED">Married</MenuItem>
                                <MenuItem value="DIVORCED">Divorced</MenuItem>
                                <MenuItem value="WIDOWED">Widowed</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Contact Information */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Contact Information
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
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
                                label="Mobile Phone"
                                name="mobilePhone"
                                value={formData.mobilePhone}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Employment Information */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Employment Information
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Employee Number"
                                name="employeeNumber"
                                value={formData.employeeNumber}
                                onChange={handleChange}
                                disabled
                                helperText="Employee number cannot be changed"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Date of Hire"
                                name="dateOfHire"
                                value={formData.dateOfHire}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Contract Type"
                                name="contractType"
                                value={formData.contractType}
                                onChange={handleChange}
                            >
                                <MenuItem value="FULL_TIME">Full Time</MenuItem>
                                <MenuItem value="PART_TIME">Part Time</MenuItem>
                                <MenuItem value="CONTRACT">Contract</MenuItem>
                                <MenuItem value="TEMPORARY">Temporary</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Work Type"
                                name="workType"
                                value={formData.workType}
                                onChange={handleChange}
                            >
                                <MenuItem value="FULL_TIME">Full Time</MenuItem>
                                <MenuItem value="PART_TIME">Part Time</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Contract Start Date"
                                name="contractStartDate"
                                value={formData.contractStartDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Contract End Date"
                                name="contractEndDate"
                                value={formData.contractEndDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Actions */}
                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                                <Button
                                    component={Link}
                                    href="/dashboard/employees"
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
                                    {updateMutation.isPending ? 'Updating...' : 'Update Employee'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

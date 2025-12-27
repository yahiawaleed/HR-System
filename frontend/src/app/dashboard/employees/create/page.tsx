'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
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

export default function CreateEmployeePage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateEmployeeData>({
        workEmail: '',
        password: '',
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
        status: 'ACTIVE', // Required by backend schema
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateEmployeeData) => employeeService.create(data),
        onSuccess: () => {
            router.push('/dashboard/employees');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create employee');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Remove empty string dates
        const cleanedData = { ...formData };
        if (!cleanedData.contractEndDate || cleanedData.contractEndDate === '') {
            delete cleanedData.contractEndDate;
        }
        if (!cleanedData.contractStartDate || cleanedData.contractStartDate === '') {
            delete cleanedData.contractStartDate;
        }

        createMutation.mutate(cleanedData);
    };

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
                <Typography variant="h4">Add New Employee</Typography>
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
                                required
                                type="email"
                                label="Work Email"
                                name="workEmail"
                                value={formData.workEmail}
                                onChange={handleChange}
                            />
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

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                helperText="Initial password for the employee"
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
                                <MenuItem value="FULL_TIME_CONTRACT">Full Time Contract</MenuItem>
                                <MenuItem value="PART_TIME_CONTRACT">Part Time Contract</MenuItem>
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
                                    disabled={createMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={createMutation.isPending}
                                    startIcon={createMutation.isPending && <CircularProgress size={20} />}
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Employee'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

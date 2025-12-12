'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { performanceService, AssignAppraisalData } from '@/services/performanceService';
import { employeeService } from '@/services/employeeService';
import { departmentsService } from '@/services/organizationServices';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function NewAssignmentPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<AssignAppraisalData>({
        cycleId: '',
        templateId: '',
        employeeProfileId: '',
        managerProfileId: '',
        departmentId: '',
        dueDate: '',
    });

    // Fetch Data
    const { data: cycles } = useQuery({ queryKey: ['cycles'], queryFn: performanceService.getAllCycles });
    const { data: templates } = useQuery({ queryKey: ['templates'], queryFn: performanceService.getAllTemplates });
    const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeeService.getAll(1, 100) });
    const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsService.getAll });

    const assignMutation = useMutation({
        mutationFn: performanceService.assignAppraisal,
        onSuccess: () => {
            alert('Appraisal assigned successfully!');
            router.push('/dashboard/performance/cycles');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to assign appraisal');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Auto-fill department/manager if employee selected (optional optimization)
        if (name === 'employeeProfileId') {
            const emp = employees?.data?.find((e: any) => e._id === value);
            // Note: Employee profile might not have direct manager/dept link in this list view, 
            // would need to fetch full profile or rely on user selection.
            // For now, let user select manually to be safe.
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.cycleId || !formData.templateId || !formData.employeeProfileId || !formData.managerProfileId || !formData.departmentId) {
            setError('Please fill in all required fields');
            return;
        }

        assignMutation.mutate(formData);
    };

    if (!cycles || !templates || !employees || !departments) {
        return <CircularProgress />;
    }

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
                <Typography variant="h4">Assign Appraisal</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                required
                                label="Appraisal Cycle"
                                name="cycleId"
                                value={formData.cycleId}
                                onChange={handleChange}
                            >
                                {cycles.map((cycle) => (
                                    <MenuItem key={cycle._id} value={cycle._id}>
                                        {cycle.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                required
                                label="Template"
                                name="templateId"
                                value={formData.templateId}
                                onChange={handleChange}
                            >
                                {templates.map((template) => (
                                    <MenuItem key={template._id} value={template._id}>
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                required
                                label="Employee"
                                name="employeeProfileId"
                                value={formData.employeeProfileId}
                                onChange={handleChange}
                            >
                                {employees.data?.map((emp: any) => (
                                    <MenuItem key={emp._id} value={emp._id}>
                                        {emp.fullName} ({emp.employeeNumber})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                required
                                label="Manager (Evaluator)"
                                name="managerProfileId"
                                value={formData.managerProfileId}
                                onChange={handleChange}
                            >
                                {employees.data?.map((emp: any) => (
                                    <MenuItem key={emp._id} value={emp._id}>
                                        {emp.fullName} ({emp.employeeNumber})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                required
                                label="Department"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Due Date (Optional)"
                                name="dueDate"
                                value={formData.dueDate}
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
                                    startIcon={<Send />}
                                    disabled={assignMutation.isPending}
                                >
                                    {assignMutation.isPending ? 'Assigning...' : 'Assign Appraisal'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

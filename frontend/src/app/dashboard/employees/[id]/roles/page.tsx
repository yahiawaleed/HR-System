'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/rolesService';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

const AVAILABLE_ROLES = [
    'Department Employee',
    'Department Head',
    'HR Manager',
    'HR Employee',
    'Payroll Specialist',
    'Payroll Manager',
    'System Admin',
    'Legal & Policy Admin',
    'Recruiter',
    'Finance Staff',
    'HR Admin',
];

export default function RolesPage() {
    const params = useParams();
    const employeeId = params.id as string;
    const queryClient = useQueryClient();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const { data: employeeRoles, isLoading } = useQuery({
        queryKey: ['employee-roles', employeeId],
        queryFn: () => rolesService.getEmployeeRoles(employeeId),
        enabled: !!employeeId,
    });

    useEffect(() => {
        if (employeeRoles?.roles) {
            setSelectedRoles(employeeRoles.roles);
        }
    }, [employeeRoles]);

    const updateMutation = useMutation({
        mutationFn: (roles: string[]) => {
            if (employeeRoles) {
                return rolesService.updateRoles(employeeId, roles);
            } else {
                return rolesService.assignRoles(employeeId, roles);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-roles', employeeId] });
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: () => rolesService.deactivateRoles(employeeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-roles', employeeId] });
        },
    });

    const handleChange = (event: any) => {
        const {
            target: { value },
        } = event;
        setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSave = () => {
        updateMutation.mutate(selectedRoles);
    };

    const handleDeactivate = () => {
        if (confirm('Are you sure you want to deactivate all roles for this employee?')) {
            deactivateMutation.mutate();
        }
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
                    href={`/dashboard/employees/${employeeId}`}
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">System Roles Management</Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Current Status
                    </Typography>
                    <Chip
                        label={employeeRoles?.isActive ? 'Active' : 'Inactive'}
                        color={employeeRoles?.isActive ? 'success' : 'default'}
                    />
                </Box>

                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Assigned Roles
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Select Roles</InputLabel>
                        <Select
                            multiple
                            value={selectedRoles}
                            onChange={handleChange}
                            input={<OutlinedInput label="Select Roles" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {AVAILABLE_ROLES.map((role) => (
                                <MenuItem key={role} value={role}>
                                    <Checkbox checked={selectedRoles.indexOf(role) > -1} />
                                    <ListItemText primary={role} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {employeeRoles && (
                    <Box mb={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Assigned At: {new Date(employeeRoles.assignedAt).toLocaleString()}
                        </Typography>
                    </Box>
                )}

                <Box display="flex" gap={2} justifyContent="flex-end">
                    {employeeRoles?.isActive && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDeactivate}
                            disabled={deactivateMutation.isPending}
                        >
                            {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate All Roles'}
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Roles'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

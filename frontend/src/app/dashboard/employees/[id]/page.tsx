'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { API_BASE_URL } from '@/services/api';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Divider,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
} from '@mui/material';
import { ArrowBack, PictureAsPdf, PersonOff } from '@mui/icons-material';
import Link from 'next/link';

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const employeeId = params.id as string;
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deactivateStatus, setDeactivateStatus] = useState('');

    const { data: employee, isLoading, refetch } = useQuery({
        queryKey: ['employee', employeeId],
        queryFn: () => employeeService.getById(employeeId),
        enabled: !!employeeId,
    });

    const deactivateMutation = useMutation({
        mutationFn: (status: string) => employeeService.deactivate(employeeId, status),
        onSuccess: () => {
            setDeactivateDialogOpen(false);
            refetch();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => employeeService.deletePermanently(employeeId),
        onSuccess: () => {
            setDeleteDialogOpen(false);
            router.push('/dashboard/employees');
        },
    });

    const handleExportPDF = () => {
        employeeService.exportPDF(employeeId);
    };

    const handleDeactivate = () => {
        if (deactivateStatus) {
            deactivateMutation.mutate(deactivateStatus);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                < CircularProgress />
            </Box >
        );
    }

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
                        href="/dashboard/employees"
                        startIcon={<ArrowBack />}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Avatar
                        src={employee?.profilePictureUrl ? `${API_BASE_URL}/api/employee-profile${employee.profilePictureUrl}` : undefined}
                        sx={{ width: 64, height: 64, mr: 2 }}
                    >
                        {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                    </Avatar>
                    <Typography variant="h4">{employee?.fullName}</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        onClick={handleExportPDF}
                    >
                        Export PDF
                    </Button>
                    {employee?.status === 'ACTIVE' ? (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<PersonOff />}
                            onClick={() => setDeactivateDialogOpen(true)}
                        >
                            Deactivate
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<PersonOff />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete Permanently
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Quick Actions / Navigation */}
            <Box display="flex" gap={2} mb={3}>
                <Button
                    variant="outlined"
                    component={Link}
                    href={`/dashboard/employees/${employeeId}/edit`}
                >
                    Edit Employee
                </Button>
                <Button
                    variant="outlined"
                    component={Link}
                    href={`/dashboard/employees/${employeeId}/qualifications`}
                >
                    Qualifications
                </Button>
                <Button
                    variant="outlined"
                    component={Link}
                    href={`/dashboard/employees/${employeeId}/roles`}
                >
                    Roles
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Personal Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow label="Full Name" value={employee?.fullName} />
                        <InfoRow label="Work Email" value={employee?.workEmail} />
                        <InfoRow label="Personal Email" value={employee?.personalEmail} />
                        <InfoRow label="Gender" value={employee?.gender} />
                        <InfoRow label="Marital Status" value={employee?.maritalStatus} />
                        <InfoRow
                            label="Date of Birth"
                            value={employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : undefined}
                        />
                        <InfoRow label="National ID" value={employee?.nationalId} />
                    </Paper>
                </Grid>

                {/* Employment Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Employment Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow label="Employee Number" value={employee?.employeeNumber} />
                        <InfoRow
                            label="Date of Hire"
                            value={employee?.dateOfHire ? new Date(employee.dateOfHire).toLocaleDateString() : undefined}
                        />
                        <InfoRow label="Contract Type" value={employee?.contractType} />
                        <InfoRow label="Work Type" value={employee?.workType} />

                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Box mt={0.5}>
                                <Chip
                                    label={employee?.status}
                                    color={employee?.status === 'ACTIVE' ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Contact Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Contact Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow label="Mobile Phone" value={employee?.mobilePhone} />
                        <InfoRow label="Home Phone" value={employee?.homePhone} />
                    </Paper>
                </Grid>

                {/* Bank Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Bank Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow label="Bank Name" value={employee?.bankName} />
                        <InfoRow label="Account Number" value={employee?.bankAccountNumber} />
                    </Paper>
                </Grid>
            </Grid>

            {/* Deactivate Dialog */}
            <Dialog open={deactivateDialogOpen} onClose={() => setDeactivateDialogOpen(false)}>
                <DialogTitle>Deactivate Employee</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Are you sure you want to deactivate this employee? Choose the deactivation status:
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={deactivateStatus}
                            label="Status"
                            onChange={(e) => setDeactivateStatus(e.target.value)}
                        >
                            <MenuItem value="SUSPENDED">Suspended</MenuItem>
                            <MenuItem value="TERMINATED">Terminated</MenuItem>
                            <MenuItem value="RETIRED">Retired</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDeactivate}
                        color="error"
                        variant="contained"
                        disabled={!deactivateStatus || deactivateMutation.isPending}
                    >
                        {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Permanent Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Employee Permanently</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        WARNING: This action is irreversible. All records belonging to this employee will be deleted forever.
                    </Typography>
                    <Typography variant="body2">
                        Are you absolutely sure you want to delete <strong>{employee?.fullName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => deleteMutation.mutate()}
                        color="error"
                        variant="contained"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

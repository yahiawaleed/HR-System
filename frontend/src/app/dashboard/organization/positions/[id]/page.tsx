'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { positionsService, departmentsService, assignmentsService } from '@/services/organizationServices';
import { employeeService } from '@/services/employeeService';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
} from '@mui/material';
import { ArrowBack, Edit, Delete, PersonAdd } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function PositionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const positionId = params.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignmentData, setAssignmentData] = useState({
        employeeProfileId: '',
        startDate: new Date().toISOString().split('T')[0],
        reason: '',
        notes: '',
    });
    const [assignError, setAssignError] = useState('');

    const { data: position, isLoading } = useQuery({
        queryKey: ['position', positionId],
        queryFn: () => positionsService.getById(positionId),
        enabled: !!positionId,
    });

    const { data: assignee } = useQuery({
        queryKey: ['position-assignee', positionId],
        queryFn: () => positionsService.getAssignee(positionId),
        enabled: !!positionId,
    });

    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentsService.getAll(),
    });

    const { data: positions } = useQuery({
        queryKey: ['positions'],
        queryFn: () => positionsService.getAll(),
    });

    const { data: employeesData } = useQuery({
        queryKey: ['employees-list'],
        queryFn: () => employeeService.getAll(1, 100),
    });

    const deleteMutation = useMutation({
        mutationFn: () => positionsService.delete(positionId),
        onSuccess: () => {
            router.push('/dashboard/organization/positions');
        },
    });

    const assignMutation = useMutation({
        mutationFn: (data: any) => assignmentsService.assign({ ...data, positionId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['position-assignee', positionId] });
            setAssignDialogOpen(false);
            setAssignmentData({
                employeeProfileId: '',
                startDate: new Date().toISOString().split('T')[0],
                reason: '',
                notes: '',
            });
        },
        onError: (err: any) => {
            setAssignError(err.response?.data?.message || 'Failed to assign position');
        },
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const getDepartmentName = (id: string | any) => {
        if (!id) return 'None';
        if (typeof id === 'object') return id.name;
        const dept = departments?.find(d => d._id === id);
        return dept?.name || 'Unknown';
    };

    const getPositionTitle = (id: string | any) => {
        if (!id) return 'None';
        const pos = positions?.find(p => p._id === id);
        return pos?.title || 'Unknown';
    };

    const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAssignmentData({ ...assignmentData, [e.target.name]: e.target.value });
    };

    const handleAssignSubmit = () => {
        setAssignError('');
        if (!assignmentData.employeeProfileId) {
            setAssignError('Please select an employee');
            return;
        }
        assignMutation.mutate(assignmentData);
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
                        href="/dashboard/organization/positions"
                        startIcon={<ArrowBack />}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4">{position?.title}</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setAssignDialogOpen(true)}
                    >
                        Assign Employee
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        component={Link}
                        href={`/dashboard/organization/positions/${positionId}/edit`}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Position Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Code" value={position?.code} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Title" value={position?.title} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Department" value={getDepartmentName(position?.departmentId)} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Reports To" value={getPositionTitle(position?.reportsToPositionId)} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InfoRow label="Description" value={position?.description} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box mt={0.5}>
                                        <Chip
                                            label={position?.isActive ? 'Active' : 'Inactive'}
                                            color={position?.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Current Assignment
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {assignee ? (
                            <Box>
                                <InfoRow label="Employee Name" value={assignee.fullName} />
                                <InfoRow label="Employee ID" value={assignee.employeeNumber} />
                                <InfoRow label="Email" value={assignee.workEmail} />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    component={Link}
                                    href={`/dashboard/employees/${assignee._id}`}
                                    fullWidth
                                >
                                    View Profile
                                </Button>
                            </Box>
                        ) : (
                            <Typography color="text.secondary">
                                This position is currently vacant.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Position</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the position "{position?.title}"?
                    This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => deleteMutation.mutate()}
                        color="error"
                        variant="contained"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Employee Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Employee to Position</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        {assignError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {assignError}
                            </Alert>
                        )}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Employee"
                                    name="employeeProfileId"
                                    value={assignmentData.employeeProfileId}
                                    onChange={handleAssignChange}
                                >
                                    {employeesData?.data?.map((emp: any) => (
                                        <MenuItem key={emp._id} value={emp._id}>
                                            {emp.fullName} ({emp.employeeNumber})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Start Date"
                                    name="startDate"
                                    value={assignmentData.startDate}
                                    onChange={handleAssignChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Reason (Optional)"
                                    name="reason"
                                    value={assignmentData.reason}
                                    onChange={handleAssignChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Notes (Optional)"
                                    name="notes"
                                    value={assignmentData.notes}
                                    onChange={handleAssignChange}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssignSubmit}
                        variant="contained"
                        disabled={assignMutation.isPending}
                    >
                        {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsService } from '@/services/organizationServices';
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
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function DepartmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const departmentId = params.id as string;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: department, isLoading } = useQuery({
        queryKey: ['department', departmentId],
        queryFn: () => departmentsService.getById(departmentId),
        enabled: !!departmentId,
    });

    const { data: positions } = useQuery({
        queryKey: ['department-positions', departmentId],
        queryFn: () => departmentsService.getPositions(departmentId),
        enabled: !!departmentId,
    });

    const deleteMutation = useMutation({
        mutationFn: () => departmentsService.delete(departmentId),
        onSuccess: () => {
            router.push('/dashboard/organization/departments');
        },
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
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
                        href="/dashboard/organization/departments"
                        startIcon={<ArrowBack />}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4">{department?.name}</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        component={Link}
                        href={`/dashboard/organization/departments/${departmentId}/edit`}
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
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Department Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <InfoRow label="Code" value={department?.code} />
                        <InfoRow label="Name" value={department?.name} />
                        <InfoRow label="Description" value={department?.description} />
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Box mt={0.5}>
                                <Chip
                                    label={department?.isActive ? 'Active' : 'Inactive'}
                                    color={department?.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Positions ({positions?.length || 0})
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {positions?.length === 0 ? (
                            <Typography color="text.secondary">No positions in this department</Typography>
                        ) : (
                            <Box>
                                {positions?.map((position) => (
                                    <Box key={position._id} mb={1}>
                                        <Typography variant="body2">
                                            <strong>{position.title}</strong> ({position.code})
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {position.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Department</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the department "{department?.name}"?
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
        </Box>
    );
}

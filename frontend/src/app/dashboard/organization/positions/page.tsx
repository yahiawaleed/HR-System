'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { positionsService, departmentsService, Position } from '@/services/organizationServices';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, ToggleOn, ToggleOff, Visibility } from '@mui/icons-material';
import Link from 'next/link';

export default function PositionsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

    const { data: positions, isLoading } = useQuery({
        queryKey: ['positions'],
        queryFn: () => positionsService.getAll(),
    });

    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentsService.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => positionsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setDeleteDialogOpen(false);
            setSelectedPosition(null);
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            isActive ? positionsService.deactivate(id) : positionsService.activate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
        },
    });

    const getDepartmentName = (departmentId: string) => {
        const dept = departments?.find(d => d._id === departmentId);
        return dept?.name || 'Unknown';
    };

    const getPositionTitle = (positionId?: string) => {
        if (!positionId) return 'None';
        const pos = positions?.find(p => p._id === positionId);
        return pos?.title || 'Unknown';
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
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4">Positions</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    href="/dashboard/organization/positions/create"
                >
                    Create Position
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Reports To</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {positions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No positions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            positions?.map((position) => (
                                <TableRow key={position._id}>
                                    <TableCell>{position.code}</TableCell>
                                    <TableCell>{position.title}</TableCell>
                                    <TableCell>{getDepartmentName(position.departmentId)}</TableCell>
                                    <TableCell>{getPositionTitle(position.reportsToPositionId)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={position.isActive ? 'Active' : 'Inactive'}
                                            color={position.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={Link}
                                            href={`/dashboard/organization/positions/${position._id}`}
                                            size="small"
                                            title="View"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            href={`/dashboard/organization/positions/${position._id}/edit`}
                                            size="small"
                                            title="Edit"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => toggleActiveMutation.mutate({ id: position._id, isActive: position.isActive })}
                                            size="small"
                                            title={position.isActive ? 'Deactivate' : 'Activate'}
                                            disabled={toggleActiveMutation.isPending}
                                        >
                                            {position.isActive ? <ToggleOff /> : <ToggleOn />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedPosition(position);
                                                setDeleteDialogOpen(true);
                                            }}
                                            size="small"
                                            color="error"
                                            title="Delete"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Position</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the position "{selectedPosition?.title}"?
                    This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => selectedPosition && deleteMutation.mutate(selectedPosition._id)}
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

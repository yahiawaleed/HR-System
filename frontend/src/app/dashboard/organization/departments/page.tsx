'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsService, Department } from '@/services/organizationServices';
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

export default function DepartmentsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentsService.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => departmentsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            setDeleteDialogOpen(false);
            setSelectedDepartment(null);
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            isActive ? departmentsService.deactivate(id) : departmentsService.activate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });

    const handleDelete = () => {
        if (selectedDepartment) {
            deleteMutation.mutate(selectedDepartment._id);
        }
    };

    const handleToggleActive = (dept: Department) => {
        toggleActiveMutation.mutate({ id: dept._id, isActive: dept.isActive });
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
                <Typography variant="h4">Departments</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    href="/dashboard/organization/departments/create"
                >
                    Create Department
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No departments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            departments?.map((dept) => (
                                <TableRow key={dept._id}>
                                    <TableCell>{dept.code}</TableCell>
                                    <TableCell>{dept.name}</TableCell>
                                    <TableCell>{dept.description || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={dept.isActive ? 'Active' : 'Inactive'}
                                            color={dept.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={Link}
                                            href={`/dashboard/organization/departments/${dept._id}`}
                                            size="small"
                                            title="View"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            href={`/dashboard/organization/departments/${dept._id}/edit`}
                                            size="small"
                                            title="Edit"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleToggleActive(dept)}
                                            size="small"
                                            title={dept.isActive ? 'Deactivate' : 'Activate'}
                                            disabled={toggleActiveMutation.isPending}
                                        >
                                            {dept.isActive ? <ToggleOff /> : <ToggleOn />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedDepartment(dept);
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
                <DialogTitle>Delete Department</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the department "{selectedDepartment?.name}"?
                    This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDelete}
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

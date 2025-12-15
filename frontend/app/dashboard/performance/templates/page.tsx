'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService, AppraisalTemplate } from '@/services/performanceService';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function TemplatesPage() {
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: performanceService.getAllTemplates,
    });

    const deleteMutation = useMutation({
        mutationFn: performanceService.deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setDeleteDialogOpen(false);
            setSelectedTemplateId(null);
        },
    });

    const handleDeleteClick = (id: string) => {
        setSelectedTemplateId(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedTemplateId) {
            deleteMutation.mutate(selectedTemplateId);
        }
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Appraisal Templates</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    href="/dashboard/performance/templates/create"
                >
                    Create Template
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Sections</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates?.map((template) => (
                            <TableRow key={template._id}>
                                <TableCell>{template.name}</TableCell>
                                <TableCell>{template.description || '-'}</TableCell>
                                <TableCell>{template.sections?.length || 0}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={template.isActive ? 'Active' : 'Inactive'}
                                        color={template.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        component={Link}
                                        href={`/dashboard/performance/templates/${template._id}/edit`}
                                        color="primary"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(template._id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {templates?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No templates found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Template</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this template? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

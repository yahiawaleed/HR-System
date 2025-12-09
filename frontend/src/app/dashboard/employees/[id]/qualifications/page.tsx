'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qualificationsService, CreateQualificationData } from '@/services/qualificationsService';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    MenuItem,
    Chip,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import Link from 'next/link';

export default function QualificationsPage() {
    const params = useParams();
    const employeeId = params.id as string;
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<CreateQualificationData>({
        establishmentName: '',
        graduationType: '',
    });

    const { data: qualifications, isLoading } = useQuery({
        queryKey: ['qualifications', employeeId],
        queryFn: () => qualificationsService.getQualifications(employeeId),
        enabled: !!employeeId,
    });

    const addMutation = useMutation({
        mutationFn: (data: CreateQualificationData) =>
            qualificationsService.addQualification(employeeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qualifications', employeeId] });
            setDialogOpen(false);
            setFormData({
                establishmentName: '',
                graduationType: '',
            });
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMutation.mutate(formData);
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
                <Box display="flex" alignItems="center">
                    <Button
                        component={Link}
                        href={`/dashboard/employees/${employeeId}`}
                        startIcon={<ArrowBack />}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4">Qualifications</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setDialogOpen(true)}
                >
                    Add Qualification
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Institution</TableCell>
                            <TableCell>Establishment Name</TableCell>
                            <TableCell>Graduation Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {qualifications?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    No qualifications found
                                </TableCell>
                            </TableRow>
                        ) : (
                            qualifications?.map((qual: any) => (
                                <TableRow key={qual._id}>
                                    <TableCell>{qual.establishmentName}</TableCell>
                                    <TableCell>{qual.graduationType}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Qualification Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add Qualification</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Establishment Name"
                                    name="establishmentName"
                                    value={formData.establishmentName}
                                    onChange={handleChange}
                                    helperText="e.g., University of Cairo, MIT, etc."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    select
                                    label="Graduation Type"
                                    name="graduationType"
                                    value={formData.graduationType || ''}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="UNDERGRADE">Undergrad</MenuItem>
                                    <MenuItem value="BACHELOR">Bachelor</MenuItem>
                                    <MenuItem value="MASTER">Master</MenuItem>
                                    <MenuItem value="PHD">PhD</MenuItem>
                                    <MenuItem value="OTHER">Other</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={addMutation.isPending}
                        >
                            {addMutation.isPending ? 'Adding...' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

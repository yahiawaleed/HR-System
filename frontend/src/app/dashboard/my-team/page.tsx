'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Container,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { teamService } from '@/services/organizationServices';
import { changeRequestsService } from '@/services/changeRequestsService';
import { Email as EmailIcon, Work as WorkIcon, Business as BusinessIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    position: string;
    department: string;
    assignmentDate: string;
}

export default function MyTeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openRequestDialog, setOpenRequestDialog] = useState(false);
    const [requestData, setRequestData] = useState({
        title: '',
        departmentId: '',
        reason: '',
        description: ''
    });
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await teamService.getMyTeam();
                setTeam(data);
            } catch (err: any) {
                console.error('Error fetching team:', err);
                setError('Failed to load team members. You may not have any direct reports or management permissions.');
            } finally {
                setLoading(false);
            }
        };

        const fetchDepartments = async () => {
            try {
                // We need departments for the dropdown
                // Assuming departmentsService is available or we can fetch them
                // For now, we might need to import departmentsService
            } catch (err) {
                console.error('Error fetching departments:', err);
            }
        };

        fetchTeam();
    }, []);

    const handleRequestSubmit = async () => {
        try {
            // Use the changeRequestsService from organizationServices (or import it if exported separately)
            // Since it's not exported as a standalone default, we might need to import it named
            // But wait, I can just use the one I updated in changeRequestsService.ts!
            // Actually, the plan said "Update service to include Organization Structure change request endpoints" in changeRequestsService.ts
            // So I should use THAT service.

            // Let's assume we import changeRequestsService from '@/services/changeRequestsService'

            await changeRequestsService.createOrgChangeRequest({
                requestType: 'NEW_POSITION',
                details: JSON.stringify({
                    title: requestData.title,
                    departmentId: requestData.departmentId,
                    description: requestData.description
                }),
                reason: requestData.reason
            });

            setOpenRequestDialog(false);
            alert('Request submitted successfully!');
            setRequestData({ title: '', departmentId: '', reason: '', description: '' });
        } catch (err: any) {
            alert('Failed to submit request: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        My Team
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of your direct reports and their status.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<WorkIcon />}
                    onClick={() => setOpenRequestDialog(true)}
                >
                    Request New Position
                </Button>
            </Box>

            {error ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            ) : team.length === 0 ? (
                <Alert severity="info">
                    You currently have no direct reports assigned to your position.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {team.map((member) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            fontSize: '2rem',
                                            bgcolor: 'primary.main',
                                            mx: 'auto',
                                            mb: 2
                                        }}
                                    >
                                        {member.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        {member.name}
                                    </Typography>
                                    <Chip
                                        label={member.position}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box display="flex" alignItems="center" justifyContent="center" mb={1} gap={1} color="text.secondary">
                                        <BusinessIcon fontSize="small" />
                                        <Typography variant="body2">{member.department}</Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" justifyContent="center" mb={1} gap={1} color="text.secondary">
                                        <EmailIcon fontSize="small" />
                                        <Typography variant="body2" noWrap>{member.email}</Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} color="text.secondary">
                                        <CalendarIcon fontSize="small" />
                                        <Typography variant="body2" title="Assignment Date">
                                            Since {new Date(member.assignmentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </Typography>
                                    </Box>

                                </CardContent>
                                <Box p={2} pt={0}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        href={`/dashboard/performance/history/${member.id}`}
                                    >
                                        View Performance
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request New Position</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Position Title"
                            fullWidth
                            value={requestData.title}
                            onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
                        />
                        <TextField
                            label="Department ID (Optional)"
                            fullWidth
                            value={requestData.departmentId}
                            onChange={(e) => setRequestData({ ...requestData, departmentId: e.target.value })}
                            helperText="Leave empty to use your current department"
                        />
                        <TextField
                            label="Reason for Request"
                            fullWidth
                            multiline
                            rows={2}
                            value={requestData.reason}
                            onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                        />
                        <TextField
                            label="Detailed Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={requestData.description}
                            onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRequestSubmit}>Submit Request</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

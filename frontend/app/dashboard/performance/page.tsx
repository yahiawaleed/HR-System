'use client';

import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { authService } from '@/services/authService';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Chip,
    Divider,
} from '@mui/material';
import {
    Assessment,
    Assignment,
    DateRange,
    Description,
    Group,
    TrendingUp,
    PendingActions,
    History,
    Gavel,
    BarChart,
} from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PerformanceDashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
    }, []);

    const { data: progress, isLoading: isLoadingProgress } = useQuery({
        queryKey: ['performance-progress'],
        queryFn: performanceService.getAppraisalProgress,
        enabled: !!user && (user.role === 'HR Manager' || user.role === 'Admin' || user.role === 'HR Admin' || user.role === 'System Admin'),
    });

    const { data: myAppraisals, isLoading: isLoadingMyAppraisals } = useQuery({
        queryKey: ['my-appraisals', user?.userId],
        queryFn: () => performanceService.getMyAppraisals(user.userId),
        enabled: !!user?.userId,
    });

    const pendingAppraisals = myAppraisals?.filter(
        (a) => a.status === 'NOT_STARTED' || a.status === 'IN_PROGRESS' || a.status === 'SUBMITTED'
    );

    if (!user) {
        return <CircularProgress />;
    }

    const isHR = user.role === 'HR Manager' || user.role === 'Admin' || user.role === 'HR Admin' || user.role === 'System Admin';
    const isManager = user.role === 'Manager' || user.role === 'HR Manager' || user.role === 'Admin' || user.role === 'System Admin' || user.role === 'Department Head';

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                            {title}
                        </Typography>
                        <Typography variant="h4">{value}</Typography>
                    </Box>
                    <Box sx={{ color: `${color}.main`, p: 1, borderRadius: 2, bgcolor: `${color}.light` }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const NavCard = ({ title, description, icon, href, color }: any) => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ mr: 2, color: `${color}.main` }}>{icon}</Box>
                    <Typography variant="h6">{title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={Link} href={href} fullWidth variant="outlined">
                    Go to {title}
                </Button>
            </CardActions>
        </Card>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Performance Management
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Manage appraisals, cycles, and templates.
            </Typography>

            {/* HR Stats Section */}
            {isHR && (
                <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                        Overview
                    </Typography>
                    {isLoadingProgress ? (
                        <CircularProgress />
                    ) : (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Total Appraisals"
                                    value={progress?.total || 0}
                                    icon={<Assessment />}
                                    color="primary"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="In Progress"
                                    value={progress?.inProgress || 0}
                                    icon={<TrendingUp />}
                                    color="warning"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Completed"
                                    value={(progress?.submitted || 0) + (progress?.published || 0)}
                                    icon={<Assignment />}
                                    color="success"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Completion Rate"
                                    value={`${progress?.completionRate || 0}%`}
                                    icon={<PendingActions />}
                                    color="info"
                                />
                            </Grid>
                        </Grid>
                    )}
                </Box>
            )}

            {/* My Pending Actions */}
            <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                    My Pending Actions
                </Typography>
                {isLoadingMyAppraisals ? (
                    <CircularProgress />
                ) : (
                    <Paper sx={{ p: 2 }}>
                        {pendingAppraisals && pendingAppraisals.length > 0 ? (
                            <Box>
                                {pendingAppraisals.map((appraisal) => (
                                    <Box key={appraisal._id} mb={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {appraisal.cycleId && typeof appraisal.cycleId === 'object' ? (appraisal.cycleId as any).name : 'Appraisal Cycle'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Due: {appraisal.dueDate ? new Date(appraisal.dueDate).toLocaleDateString() : 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Chip
                                                    label={appraisal.status.replace('_', ' ')}
                                                    color={appraisal.status === 'IN_PROGRESS' ? 'warning' : 'default'}
                                                    size="small"
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    component={Link}
                                                    href={`/dashboard/performance/appraisals/${appraisal._id}`}
                                                >
                                                    View
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography color="text.secondary">No pending actions.</Typography>
                        )}
                    </Paper>
                )}
            </Box>

            {/* Navigation Links */}
            <Typography variant="h6" gutterBottom>
                Quick Links
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <NavCard
                        title="My Appraisals"
                        description="View your performance history and self-assessments."
                        icon={<Assessment fontSize="large" />}
                        href="/dashboard/performance/appraisals"
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <NavCard
                        title="My History"
                        description="View your past appraisal records and scores."
                        icon={<History fontSize="large" />}
                        href="/dashboard/performance/history"
                        color="secondary"
                    />
                </Grid>

                {/* Manager Section */}
                {isManager && (
                    <Grid size={{ xs: 12, md: 4 }}>
                        <NavCard
                            title="Team Appraisals"
                            description="Manage performance reviews for your team members."
                            icon={<Group fontSize="large" />}
                            href="/dashboard/performance/team"
                            color="secondary"
                        />
                    </Grid>
                )}

                {/* HR Section */}
                {isHR && (
                    <>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <NavCard
                                title="Appraisal Cycles"
                                description="Manage performance review cycles and timelines."
                                icon={<DateRange fontSize="large" />}
                                href="/dashboard/performance/cycles"
                                color="info"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <NavCard
                                title="Templates"
                                description="Create and manage appraisal templates and criteria."
                                icon={<Description fontSize="large" />}
                                href="/dashboard/performance/templates"
                                color="warning"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <NavCard
                                title="Disputes"
                                description="Manage and resolve appraisal disputes."
                                icon={<Gavel fontSize="large" />}
                                href="/dashboard/performance/disputes"
                                color="error"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <NavCard
                                title="Reports"
                                description="View performance cycle reports and analytics."
                                icon={<BarChart fontSize="large" />}
                                href="/dashboard/performance/reports"
                                color="success"
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
}

'use client';

import { Grid, Paper, Box, Typography, Avatar } from '@mui/material';
import { People, Assignment, Groups, TrendingUp } from '@mui/icons-material';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { changeRequestsService } from '@/services/changeRequestsService';
import { teamService } from '@/services/organizationServices';

const StatCard = ({ title, value, icon, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 20px -5px ${alpha(color, 0.2)}`,
                }
            }}
        >
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    <CountUp end={value} duration={2.5} separator="," />
                </Typography>
            </Box>
            <Avatar
                sx={{
                    bgcolor: alpha(color, 0.1),
                    color: color,
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                }}
            >
                {icon}
            </Avatar>
        </Paper>
    </motion.div>
);

export default function StatsOverview() {
    // Fetch Total Employees
    const { data: employeesData } = useQuery({
        queryKey: ['stats-employees'],
        queryFn: () => employeeService.getAll(1, 1), // Minimal fetch just for total
    });

    // Fetch Pending Requests
    const { data: requestsData } = useQuery({
        queryKey: ['stats-requests'],
        queryFn: () => changeRequestsService.getAllChangeRequests(1, 100, 'PENDING'),
    });

    // Fetch My Team
    const { data: teamData } = useQuery({
        queryKey: ['stats-team'],
        queryFn: () => teamService.getMyTeam(),
    });

    const stats = [
        {
            title: 'Total Employees',
            value: employeesData?.total || 0,
            icon: <People sx={{ fontSize: 28 }} />,
            color: '#2563EB',
            delay: 0,
        },
        {
            title: 'Active Requests',
            value: requestsData?.total || 0,
            icon: <Assignment sx={{ fontSize: 28 }} />,
            color: '#F59E0B',
            delay: 0.1,
        },
        {
            title: 'My Team',
            value: teamData?.length || 0,
            icon: <Groups sx={{ fontSize: 28 }} />,
            color: '#7C4DFF',
            delay: 0.2,
        },
        {
            title: 'Performance',
            value: 98, // Mock data for now
            icon: <TrendingUp sx={{ fontSize: 28 }} />,
            color: '#10B981',
            delay: 0.3,
            suffix: '%',
        },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>
    );
}

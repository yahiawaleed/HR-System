'use client';

import { Typography, Box, Grid, Card, CardContent, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ReceiptLong, RequestQuote, ReportProblem, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PayrollTrackingPage() {
    const router = useRouter();

    const cards = [
        {
            title: 'My Payslips',
            description: 'View and download your monthly payslips',
            icon: <ReceiptLong />,
            href: '/dashboard/payroll/my-payslips',
            color: '#059669', // Green
        },
        {
            title: 'My Claims',
            description: 'Submit and track reimbursement claims',
            icon: <RequestQuote />,
            href: '/dashboard/payroll/claims',
            color: '#D97706', // Amber
        },
        {
            title: 'My Disputes',
            description: 'Raise and manage salary disputes',
            icon: <ReportProblem />,
            href: '/dashboard/payroll/disputes',
            color: '#DC2626', // Red
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }} onClick={() => router.back()}>
                    <ArrowBack sx={{ mr: 1 }} />
                    <Typography variant="body1">Back to Dashboard</Typography>
                </Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    Payroll Tracking
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your payroll information, claims, and disputes.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={card.title}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                            <Card
                                component={Link}
                                href={card.href}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textDecoration: 'none',
                                    borderRadius: 4,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(card.color, 0.1),
                                            color: card.color,
                                            width: 56,
                                            height: 56,
                                            mb: 2,
                                            borderRadius: 3,
                                        }}
                                    >
                                        {card.icon}
                                    </Avatar>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {card.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </motion.div>
    );
}

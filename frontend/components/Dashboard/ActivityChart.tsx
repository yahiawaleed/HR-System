'use client';

import { Paper, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { alpha } from '@mui/material/styles';

const data = [
    { name: 'Jan', activity: 40, growth: 24 },
    { name: 'Feb', activity: 30, growth: 13 },
    { name: 'Mar', activity: 20, growth: 98 },
    { name: 'Apr', activity: 27, growth: 39 },
    { name: 'May', activity: 18, growth: 48 },
    { name: 'Jun', activity: 23, growth: 38 },
    { name: 'Jul', activity: 34, growth: 43 },
];

export default function ActivityChart() {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Activity Trends
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.1)} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Area type="monotone" dataKey="activity" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                        <Area type="monotone" dataKey="growth" stroke="#7C4DFF" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}

'use client';

import { createTheme, alpha } from '@mui/material/styles';

// Define custom colors
const primaryColor = '#2563EB'; // Vibrant Blue
const secondaryColor = '#7C4DFF'; // Deep Purple
const successColor = '#10B981'; // Emerald
const warningColor = '#F59E0B'; // Amber
const errorColor = '#EF4444'; // Red
const infoColor = '#3B82F6'; // Blue

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: primaryColor,
            light: alpha(primaryColor, 0.5),
            dark: '#1D4ED8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: secondaryColor,
            light: alpha(secondaryColor, 0.5),
            dark: '#5B21B6',
            contrastText: '#ffffff',
        },
        success: {
            main: successColor,
        },
        warning: {
            main: warningColor,
        },
        error: {
            main: errorColor,
        },
        info: {
            main: infoColor,
        },
        background: {
            default: '#F8FAFC', // Slate 50
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E293B', // Slate 800
            secondary: '#64748B', // Slate 500
        },
        divider: alpha('#64748B', 0.1),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F8FAFC',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#F1F5F9',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#CBD5E1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#94A3B8',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '10px',
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #1D4ED8 100%)`,
                },
                containedSecondary: {
                    background: `linear-gradient(135deg, ${secondaryColor} 0%, #5B21B6 100%)`,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
                rounded: {
                    borderRadius: '16px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': {
                            borderColor: '#E2E8F0',
                        },
                        '&:hover fieldset': {
                            borderColor: '#CBD5E1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                            borderWidth: '2px',
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight: 500,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    color: '#1E293B',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

export default theme;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useState } from 'react';
import NotificationBell from '@/components/Notifications/NotificationBell';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only showing loading state on client
    useEffect(() => {
        setMounted(true);
    }, []);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (user?.isTemporaryPassword) {
            setPasswordModalOpen(true);
        }
    }, [user]);

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        try {
            await authService.changePassword({ userId: user!.userId, newPassword });
            setPasswordModalOpen(false);
            // Update local user state to reflect change
            const updatedUser = { ...user!, isTemporaryPassword: false };
            // We need to update the context, but for now let's just close the modal
            // Ideally, we should have an update method in context or re-login
            alert('Password changed successfully. Please login again.');
            logout();
            router.push('/login');
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        }
    };

    if (!mounted) {
        return null;
    }

    if (isLoading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Loading...</Typography>
            </div>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="sticky" color="default" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        HR System
                    </Typography>
                    <Button color="inherit" onClick={() => router.push('/dashboard')} sx={{ mr: 2 }}>
                        Home
                    </Button>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        {user.fullName} ({user.role})
                    </Typography>
                    <NotificationBell />
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleLogout}>
                            <Logout fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                {children}
            </Container>

            {/* Force Password Change Modal */}
            <Dialog open={passwordModalOpen} disableEscapeKeyDown>
                <DialogTitle>Change Temporary Password</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        You are using a temporary password. Please set a new password to continue.
                    </DialogContentText>
                    {passwordError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {passwordError}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePasswordChange} variant="contained">
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

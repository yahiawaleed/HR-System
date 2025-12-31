'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { employeeService } from '@/services/employeeService';
import { API_BASE_URL } from '@/services/api';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Divider,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    IconButton,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Person, Email, Badge, CalendarToday, Work, Edit, CameraAlt, Phone, Home } from '@mui/icons-material';

export default function ProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getMyProfile(),
    });

    const [changeRequestDialog, setChangeRequestDialog] = useState(false);
    const [contactEditDialog, setContactEditDialog] = useState(false);
    const [requestData, setRequestData] = useState({
        field: '',
        proposedValue: '',
        reason: ''
    });
    const [contactData, setContactData] = useState({
        mobilePhone: '',
        homePhone: '',
        personalEmail: '',
        address: '',
        biography: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Contact info update mutation
    const contactMutation = useMutation({
        mutationFn: (data: typeof contactData) => employeeService.updateContactInfo(profile?._id || '', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setContactEditDialog(false);
            setSnackbar({ open: true, message: 'Contact info updated successfully!', severity: 'success' });
        },
        onError: () => {
            setSnackbar({ open: true, message: 'Failed to update contact info', severity: 'error' });
        },
    });

    // Profile picture upload mutation
    const pictureMutation = useMutation({
        mutationFn: (file: File) => employeeService.uploadProfilePicture(profile?._id || '', file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setSnackbar({ open: true, message: 'Profile picture updated!', severity: 'success' });
        },
        onError: () => {
            setSnackbar({ open: true, message: 'Failed to upload picture', severity: 'error' });
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setSnackbar({ open: true, message: 'File size must be less than 5MB', severity: 'error' });
                return;
            }
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                setSnackbar({ open: true, message: 'Only JPEG, PNG, and WebP images are allowed', severity: 'error' });
                return;
            }
            pictureMutation.mutate(file);
        }
    };

    const handleContactEdit = () => {
        setContactData({
            mobilePhone: profile?.mobilePhone || '',
            homePhone: profile?.homePhone || '',
            personalEmail: profile?.personalEmail || '',
            // Handle address whether it's a string or object
            address: typeof profile?.address === 'string'
                ? profile.address
                : (profile?.address as any)?.streetAddress || '',
            biography: profile?.biography || '',
        });
        setContactEditDialog(true);
    };

    const handleContactSave = () => {
        contactMutation.mutate(contactData);
    };

    const handleRequestChange = async () => {
        if (!requestData.field || !requestData.proposedValue) return;
        try {
            const description = `Change ${requestData.field} to "${requestData.proposedValue}"`;
            await profileService.createChangeRequest({
                requestDescription: description,
                reason: requestData.reason
            });
            setChangeRequestDialog(false);
            setRequestData({ field: '', proposedValue: '', reason: '' });
            setSnackbar({ open: true, message: 'Change request submitted!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to submit request', severity: 'error' });
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Typography color="error">Error loading profile</Typography>
            </Box>
        );
    }

    const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) => (
        <Box display="flex" alignItems="center" mb={2}>
            <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body1">{value || 'N/A'}</Typography>
            </Box>
        </Box>
    );

    const profilePictureUrl = profile?.profilePictureUrl
        ? `${API_BASE_URL}/api/employee-profile${profile.profilePictureUrl}`
        : undefined;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    My Profile
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setChangeRequestDialog(true)}
                >
                    Request Change
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Profile Picture Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Box position="relative" display="inline-block">
                            <Avatar
                                src={profilePictureUrl}
                                sx={{ width: 150, height: 150, mb: 2, mx: 'auto' }}
                            >
                                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                            </Avatar>
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: 16,
                                    right: 0,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={pictureMutation.isPending}
                            >
                                <CameraAlt />
                            </IconButton>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </Box>
                        <Typography variant="h6">{profile?.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {profile?.employeeNumber}
                        </Typography>
                        <Chip
                            label={profile?.status}
                            color={profile?.status === 'ACTIVE' ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                        {profile?.biography && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                                "{profile.biography}"
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Personal Information */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Personal Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoRow
                                    icon={<Person />}
                                    label="Full Name"
                                    value={profile?.fullName}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoRow
                                    icon={<Email />}
                                    label="Work Email"
                                    value={profile?.workEmail}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoRow
                                    icon={<Email />}
                                    label="Personal Email"
                                    value={profile?.personalEmail}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoRow
                                    icon={<Person />}
                                    label="Gender"
                                    value={profile?.gender}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoRow
                                    icon={<Person />}
                                    label="Marital Status"
                                    value={profile?.maritalStatus}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoRow
                                    icon={<CalendarToday />}
                                    label="Date of Birth"
                                    value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : undefined}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Employment Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Employment Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow
                            icon={<Badge />}
                            label="Employee Number"
                            value={profile?.employeeNumber}
                        />
                        <InfoRow
                            icon={<CalendarToday />}
                            label="Date of Hire"
                            value={profile?.dateOfHire ? new Date(profile.dateOfHire).toLocaleDateString() : undefined}
                        />
                        <InfoRow
                            icon={<Work />}
                            label="Contract Type"
                            value={profile?.contractType}
                        />
                        <InfoRow
                            icon={<Work />}
                            label="Work Type"
                            value={profile?.workType}
                        />
                    </Paper>
                </Grid>

                {/* Contact Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Contact & Bio
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<Edit />}
                                onClick={handleContactEdit}
                            >
                                Edit
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow
                            icon={<Phone />}
                            label="Mobile Phone"
                            value={profile?.mobilePhone}
                        />
                        <InfoRow
                            icon={<Home />}
                            label="Home Phone"
                            value={profile?.homePhone}
                        />
                    </Paper>
                </Grid>

                {/* Bank Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Bank Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow
                            icon={<Work />}
                            label="Bank Name"
                            value={profile?.bankName}
                        />
                        <InfoRow
                            icon={<Work />}
                            label="Account Number"
                            value={profile?.bankAccountNumber}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Contact Edit Dialog */}
            <Dialog open={contactEditDialog} onClose={() => setContactEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Contact Information</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                        You can update your contact information directly without requiring approval.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Mobile Phone"
                        fullWidth
                        value={contactData.mobilePhone}
                        onChange={(e) => setContactData({ ...contactData, mobilePhone: e.target.value })}
                        placeholder="+201234567890"
                    />
                    <TextField
                        margin="dense"
                        label="Home Phone"
                        fullWidth
                        value={contactData.homePhone}
                        onChange={(e) => setContactData({ ...contactData, homePhone: e.target.value })}
                        placeholder="+20233456789"
                    />
                    <TextField
                        margin="dense"
                        label="Personal Email"
                        fullWidth
                        type="email"
                        value={contactData.personalEmail}
                        onChange={(e) => setContactData({ ...contactData, personalEmail: e.target.value })}
                        placeholder="personal@example.com"
                    />
                    <TextField
                        margin="dense"
                        label="Address"
                        fullWidth
                        multiline
                        rows={2}
                        value={contactData.address}
                        onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                        placeholder="123 Main Street, Cairo, Egypt"
                    />
                    <TextField
                        margin="dense"
                        label="Biography"
                        fullWidth
                        multiline
                        rows={3}
                        value={contactData.biography}
                        onChange={(e) => setContactData({ ...contactData, biography: e.target.value })}
                        placeholder="Tell us a bit about yourself..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setContactEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleContactSave}
                        variant="contained"
                        disabled={contactMutation.isPending}
                    >
                        {contactMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Request Dialog */}
            <Dialog open={changeRequestDialog} onClose={() => setChangeRequestDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Profile Change</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                        Submit a request to update your profile information. HR will review your request.
                    </Typography>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Field to Change</InputLabel>
                        <Select
                            value={requestData.field}
                            label="Field to Change"
                            onChange={(e) => setRequestData({ ...requestData, field: e.target.value })}
                        >
                            <MenuItem value="Full Name">Full Name</MenuItem>
                            <MenuItem value="Marital Status">Marital Status</MenuItem>
                            <MenuItem value="Date of Birth">Date of Birth</MenuItem>
                            <MenuItem value="Bank Name">Bank Name</MenuItem>
                            <MenuItem value="Bank Account Number">Bank Account Number</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        label="Proposed Value"
                        fullWidth
                        required
                        value={requestData.proposedValue}
                        onChange={(e) => setRequestData({ ...requestData, proposedValue: e.target.value })}
                        placeholder="Enter the new value"
                    />

                    <TextField
                        margin="dense"
                        label="Reason / Additional Details"
                        fullWidth
                        multiline
                        rows={2}
                        value={requestData.reason}
                        onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                        placeholder="e.g., Got married last week"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChangeRequestDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleRequestChange}
                        variant="contained"
                        disabled={!requestData.field || !requestData.proposedValue}
                    >
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

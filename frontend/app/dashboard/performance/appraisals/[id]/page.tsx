'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService, SubmitFeedbackData, SelfAssessmentData } from '@/services/performanceService';
import { authService } from '@/services/authService';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Divider,
    TextField,
    Rating,
    Card,
    CardContent,
    Alert,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import { ArrowBack, Save, CheckCircle, Publish, RateReview, ReportProblem } from '@mui/icons-material';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AppraisalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const appraisalId = params.id as string;
    const [user, setUser] = useState<any>(null);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState('');

    // Form States
    const [selfAssessment, setSelfAssessment] = useState<SelfAssessmentData>({
        strengths: '',
        weaknesses: '',
        achievements: '',
        goals: '',
    });

    const [managerFeedback, setManagerFeedback] = useState<SubmitFeedbackData>({
        sections: [],
        managerFeedback: '',
    });

    // Dispute State
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [disputeData, setDisputeData] = useState({ reason: '', description: '' });

    useEffect(() => {
        setUser(authService.getStoredUser());
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['appraisal', appraisalId],
        queryFn: () => performanceService.getAppraisalByAssignmentId(appraisalId),
        enabled: !!appraisalId,
    });

    const assignment = data?.assignment;
    const record = data?.record;

    // Initialize forms when data loads
    useEffect(() => {
        if (assignment && assignment.templateId && typeof assignment.templateId === 'object') {
            // Initialize Manager Feedback Form structure from Template
            if (managerFeedback.sections.length === 0) {
                const initialSections = (assignment.templateId as any).sections.map((s: any) => ({
                    title: s.title,
                    criteria: s.criteria.map((c: any) => ({
                        name: c.name,
                        managerRating: 0,
                        managerComment: '',
                    })),
                }));
                setManagerFeedback((prev) => ({ ...prev, sections: initialSections }));
            }
        }
    }, [assignment]);

    // Mutations
    const selfAssessmentMutation = useMutation({
        mutationFn: (data: SelfAssessmentData) => performanceService.submitSelfAssessment(appraisalId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appraisal', appraisalId] });
            alert('Self-assessment submitted successfully!');
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to submit self-assessment'),
    });

    const feedbackMutation = useMutation({
        mutationFn: (data: SubmitFeedbackData) => performanceService.submitManagerFeedback(appraisalId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appraisal', appraisalId] });
            alert('Manager feedback submitted successfully!');
            router.push('/dashboard/performance/team');
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to submit feedback'),
    });

    const finalizeMutation = useMutation({
        mutationFn: () => performanceService.finalizeAppraisal(appraisalId, user.userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appraisal', appraisalId] });
            alert('Appraisal finalized and published!');
        },
    });

    const acknowledgeMutation = useMutation({
        mutationFn: () => performanceService.acknowledgeAppraisal(appraisalId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appraisal', appraisalId] });
            alert('Appraisal acknowledged!');
        },
    });

    const disputeMutation = useMutation({
        mutationFn: (data: { reason: string; description: string }) =>
            performanceService.raiseDispute(appraisalId, user.userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appraisal', appraisalId] });
            setDisputeOpen(false);
            alert('Dispute raised successfully. HR will review it.');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to raise dispute');
            setDisputeOpen(false);
        }
    });

    if (isLoading || !user) {
        return <CircularProgress />;
    }

    if (!assignment) {
        return <Typography>Appraisal not found.</Typography>;
    }

    const isEmployee = assignment.employeeProfileId && user.userId === (assignment.employeeProfileId as any)._id;
    const isManager = assignment.managerProfileId && user.userId === (assignment.managerProfileId as any)._id;
    const isHR = user.role === 'HR Manager' || user.role === 'Admin';

    const handleSelfAssessmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelfAssessment({ ...selfAssessment, [e.target.name]: e.target.value });
    };

    const handleManagerRatingChange = (sIndex: number, cIndex: number, value: number | null) => {
        const newSections = [...managerFeedback.sections];
        newSections[sIndex].criteria[cIndex].managerRating = value || 0;
        setManagerFeedback({ ...managerFeedback, sections: newSections });
    };

    const handleManagerCommentChange = (sIndex: number, cIndex: number, value: string) => {
        const newSections = [...managerFeedback.sections];
        newSections[sIndex].criteria[cIndex].managerComment = value;
        setManagerFeedback({ ...managerFeedback, sections: newSections });
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href={isManager ? '/dashboard/performance/team' : '/dashboard/performance/appraisals'}
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Appraisal Details</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Header Info */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Employee</Typography>
                                <Typography variant="h6">
                                    {assignment.employeeProfileId && typeof assignment.employeeProfileId === 'object'
                                        ? (assignment.employeeProfileId as any).fullName
                                        : 'Unknown Employee'}
                                </Typography>
                                <Typography variant="body2">
                                    {assignment.employeeProfileId && typeof assignment.employeeProfileId === 'object'
                                        ? (assignment.employeeProfileId as any).employeeNumber
                                        : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Cycle</Typography>
                                <Typography variant="h6">
                                    {assignment.cycleId && typeof assignment.cycleId === 'object'
                                        ? (assignment.cycleId as any).name
                                        : 'Unknown Cycle'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Chip
                                    label={assignment.status.replace('_', ' ')}
                                    color={assignment.status === 'PUBLISHED' ? 'success' : 'primary'}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                                <Typography variant="body1">
                                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                <Tab label="Self Assessment" />
                                <Tab label="Manager Feedback" />
                                <Tab label="Summary & Actions" />
                            </Tabs>
                        </Box>

                        {/* Self Assessment Tab */}
                        <CustomTabPanel value={tabValue} index={0}>
                            {isEmployee && (assignment.status === 'IN_PROGRESS' || assignment.status === 'NOT_STARTED') ? (
                                <Box component="form" onSubmit={(e) => { e.preventDefault(); selfAssessmentMutation.mutate(selfAssessment); }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Strengths"
                                                name="strengths"
                                                value={selfAssessment.strengths}
                                                onChange={handleSelfAssessmentChange}
                                                helperText="What are your key strengths?"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Weaknesses / Areas for Improvement"
                                                name="weaknesses"
                                                value={selfAssessment.weaknesses}
                                                onChange={handleSelfAssessmentChange}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Achievements"
                                                name="achievements"
                                                value={selfAssessment.achievements}
                                                onChange={handleSelfAssessmentChange}
                                                helperText="Key achievements during this cycle"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Goals"
                                                name="goals"
                                                value={selfAssessment.goals}
                                                onChange={handleSelfAssessmentChange}
                                                helperText="Goals for the next period"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<Save />}
                                                disabled={selfAssessmentMutation.isPending}
                                            >
                                                Submit Self Assessment
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">
                                    Self-assessment is either already submitted or not available at this stage.
                                    {/* TODO: Display submitted self-assessment if available in record */}
                                </Typography>
                            )}
                        </CustomTabPanel>

                        {/* Manager Feedback Tab */}
                        <CustomTabPanel value={tabValue} index={1}>
                            {isManager && (assignment.status === 'IN_PROGRESS' || assignment.status === 'SUBMITTED') ? (
                                <Box component="form" onSubmit={(e) => { e.preventDefault(); feedbackMutation.mutate(managerFeedback); }}>
                                    {managerFeedback.sections.map((section, sIndex) => (
                                        <Card key={sIndex} sx={{ mb: 3 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>{section.title}</Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                {section.criteria.map((criteria, cIndex) => (
                                                    <Box key={cIndex} mb={3}>
                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 12, md: 4 }}>
                                                                <Typography variant="subtitle1">{criteria.name}</Typography>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 3 }}>
                                                                <Typography component="legend">Rating</Typography>
                                                                <Rating
                                                                    value={criteria.managerRating}
                                                                    onChange={(e, v) => handleManagerRatingChange(sIndex, cIndex, v)}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 5 }}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    label="Comments"
                                                                    value={criteria.managerComment}
                                                                    onChange={(e) => handleManagerCommentChange(sIndex, cIndex, e.target.value)}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Box mt={3}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label="Overall Manager Feedback"
                                            value={managerFeedback.managerFeedback}
                                            onChange={(e) => setManagerFeedback({ ...managerFeedback, managerFeedback: e.target.value })}
                                        />
                                    </Box>
                                    <Box mt={3}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<RateReview />}
                                            disabled={feedbackMutation.isPending}
                                        >
                                            Submit Feedback
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box>
                                    {record ? (
                                        <Box>
                                            <Typography variant="h6">Manager Feedback Submitted</Typography>
                                            <Typography variant="h4" color="primary" gutterBottom>
                                                Overall Score: {record.totalScore} ({record.overallRatingLabel})
                                            </Typography>
                                            {/* Display read-only feedback here if needed */}
                                        </Box>
                                    ) : (
                                        <Typography color="text.secondary">Manager feedback pending.</Typography>
                                    )}
                                </Box>
                            )}
                        </CustomTabPanel>

                        {/* Summary & Actions Tab */}
                        <CustomTabPanel value={tabValue} index={2}>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {isHR && assignment.status === 'SUBMITTED' && (
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="h6" gutterBottom>HR Actions</Typography>
                                        <Typography paragraph>
                                            Review the appraisal and finalize it to publish the results to the employee.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<Publish />}
                                            onClick={() => finalizeMutation.mutate()}
                                            disabled={finalizeMutation.isPending}
                                        >
                                            Finalize & Publish
                                        </Button>
                                    </Paper>
                                )}

                                {isEmployee && assignment.status === 'PUBLISHED' && (
                                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                                        <Typography variant="h6" gutterBottom>Employee Actions</Typography>
                                        <Typography paragraph>
                                            The appraisal has been published. Please review your results and acknowledge receipt.
                                        </Typography>
                                        <Box display="flex" gap={2}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircle />}
                                                onClick={() => acknowledgeMutation.mutate()}
                                                disabled={acknowledgeMutation.isPending}
                                            >
                                                Acknowledge Receipt
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                startIcon={<ReportProblem />}
                                                onClick={() => setDisputeOpen(true)}
                                            >
                                                Raise Dispute
                                            </Button>
                                        </Box>
                                    </Paper>
                                )}

                                {assignment.status === 'ACKNOWLEDGED' && (
                                    <Alert severity="success">
                                        This appraisal has been completed and acknowledged.
                                    </Alert>
                                )}
                            </Box>
                        </CustomTabPanel>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dispute Dialog */}
            <Dialog open={disputeOpen} onClose={() => setDisputeOpen(false)}>
                <DialogTitle>Raise a Dispute</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        If you disagree with this appraisal, you can raise a formal dispute. HR will review your case.
                        Please explain your reasons clearly.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason (Subject)"
                        fullWidth
                        variant="outlined"
                        value={disputeData.reason}
                        onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Detailed Description"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={disputeData.description}
                        onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDisputeOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => disputeMutation.mutate(disputeData)}
                        variant="contained"
                        color="warning"
                        disabled={!disputeData.reason || !disputeData.description || disputeMutation.isPending}
                    >
                        Submit Dispute
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

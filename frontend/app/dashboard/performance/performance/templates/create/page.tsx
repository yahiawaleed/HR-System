'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { performanceService, CreateTemplateData, TemplateSection, SectionCriteria } from '@/services/performanceService';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    IconButton,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Alert,
} from '@mui/material';
import { Add, Delete, ArrowBack, Save } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function CreateTemplatePage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateTemplateData>({
        name: '',
        description: '',
        templateType: '',
        ratingScale: {
            type: 'FIVE_POINT',
            min: 1,
            max: 5,
        },
        sections: [],
    });

    const createMutation = useMutation({
        mutationFn: performanceService.createTemplate,
        onSuccess: () => {
            router.push('/dashboard/performance/templates');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create template');
        },
    });

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingScaleChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            ratingScale: {
                ...formData.ratingScale,
                [field]: value
            }
        });
    };

    // Section Management
    const addSection = () => {
        setFormData({
            ...formData,
            sections: [
                ...formData.sections,
                { title: '', description: '', weight: 0, criteria: [] },
            ],
        });
    };

    const removeSection = (index: number) => {
        const newSections = [...formData.sections];
        newSections.splice(index, 1);
        setFormData({ ...formData, sections: newSections });
    };

    const handleSectionChange = (index: number, field: keyof TemplateSection, value: any) => {
        const newSections = [...formData.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setFormData({ ...formData, sections: newSections });
    };

    // Criteria Management
    const addCriteria = (sectionIndex: number) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].criteria.push({
            name: '',
            description: '',
            weight: 0,
            type: 'RATING',
        });
        setFormData({ ...formData, sections: newSections });
    };

    const removeCriteria = (sectionIndex: number, criteriaIndex: number) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].criteria.splice(criteriaIndex, 1);
        setFormData({ ...formData, sections: newSections });
    };

    const handleCriteriaChange = (
        sectionIndex: number,
        criteriaIndex: number,
        field: keyof SectionCriteria,
        value: any
    ) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].criteria[criteriaIndex] = {
            ...newSections[sectionIndex].criteria[criteriaIndex],
            [field]: value,
        };
        setFormData({ ...formData, sections: newSections });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name) {
            setError('Template name is required');
            return;
        }
        if (!formData.templateType) {
            setError('Template type is required');
            return;
        }
        if (formData.sections.length === 0) {
            setError('At least one section is required');
            return;
        }

        // Validate weights
        const totalSectionWeight = formData.sections.reduce((sum, s) => sum + Number(s.weight), 0);
        if (Math.abs(totalSectionWeight - 100) > 0.1) {
            setError(`Total section weights must equal 100. Current: ${totalSectionWeight}`);
            return;
        }

        for (const section of formData.sections) {
            const totalCriteriaWeight = section.criteria.reduce((sum, c) => sum + Number(c.weight), 0);
            if (Math.abs(totalCriteriaWeight - 100) > 0.1) {
                setError(`Total criteria weights for section "${section.title}" must equal 100. Current: ${totalCriteriaWeight}`);
                return;
            }
        }

        createMutation.mutate(formData);
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href="/dashboard/performance/templates"
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Create Appraisal Template</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Template Name"
                                name="name"
                                value={formData.name}
                                onChange={handleBasicChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Template Type"
                                name="templateType"
                                value={formData.templateType}
                                onChange={handleBasicChange}
                                SelectProps={{ native: true }}
                            >
                                <option value="" disabled>Select Type</option>
                                <option value="ANNUAL">Annual</option>
                                <option value="SEMI_ANNUAL">Semi-Annual</option>
                                <option value="PROBATIONARY">Probationary</option>
                                <option value="PROJECT">Project</option>
                                <option value="AD_HOC">Ad-Hoc</option>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleBasicChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 2 }}><Typography variant="caption" color="textSecondary">RATING SCALE</Typography></Divider>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Scale Type"
                                value={formData.ratingScale.type}
                                onChange={(e) => handleRatingScaleChange('type', e.target.value)}
                                SelectProps={{ native: true }}
                            >
                                <option value="THREE_POINT">3-Point</option>
                                <option value="FIVE_POINT">5-Point</option>
                                <option value="TEN_POINT">10-Point</option>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Minimum Value"
                                value={formData.ratingScale.min}
                                onChange={(e) => handleRatingScaleChange('min', Number(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Maximum Value"
                                value={formData.ratingScale.max}
                                onChange={(e) => handleRatingScaleChange('max', Number(e.target.value))}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Sections</Typography>
                        <Button variant="outlined" startIcon={<Add />} onClick={addSection}>
                            Add Section
                        </Button>
                    </Box>

                    {formData.sections.map((section, sIndex) => (
                        <Card key={sIndex} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Section {sIndex + 1}
                                    </Typography>
                                    <IconButton color="error" onClick={() => removeSection(sIndex)}>
                                        <Delete />
                                    </IconButton>
                                </Box>

                                <Grid container spacing={2} mb={3}>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Section Title"
                                            value={section.title}
                                            onChange={(e) => handleSectionChange(sIndex, 'title', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            value={section.description}
                                            onChange={(e) => handleSectionChange(sIndex, 'description', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            type="number"
                                            label="Weight (%)"
                                            value={section.weight}
                                            onChange={(e) => handleSectionChange(sIndex, 'weight', Number(e.target.value))}
                                        />
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Box ml={4}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="subtitle2">Criteria</Typography>
                                        <Button size="small" startIcon={<Add />} onClick={() => addCriteria(sIndex)}>
                                            Add Criteria
                                        </Button>
                                    </Box>

                                    {section.criteria.map((criteria, cIndex) => (
                                        <Grid container spacing={2} key={cIndex} alignItems="center" mb={1}>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    required
                                                    label="Criteria Name"
                                                    value={criteria.name}
                                                    onChange={(e) => handleCriteriaChange(sIndex, cIndex, 'name', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 3 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Description"
                                                    value={criteria.description}
                                                    onChange={(e) => handleCriteriaChange(sIndex, cIndex, 'description', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 2 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Type</InputLabel>
                                                    <Select
                                                        value={criteria.type}
                                                        label="Type"
                                                        onChange={(e) => handleCriteriaChange(sIndex, cIndex, 'type', e.target.value)}
                                                    >
                                                        <MenuItem value="RATING">Rating</MenuItem>
                                                        <MenuItem value="TEXT">Text</MenuItem>
                                                        <MenuItem value="BOOLEAN">Yes/No</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    required
                                                    type="number"
                                                    label="Weight (%)"
                                                    value={criteria.weight}
                                                    onChange={(e) => handleCriteriaChange(sIndex, cIndex, 'weight', Number(e.target.value))}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 1 }}>
                                                <IconButton size="small" color="error" onClick={() => removeCriteria(sIndex, cIndex)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Box display="flex" justifyContent="flex-end">
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Saving...' : 'Create Template'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

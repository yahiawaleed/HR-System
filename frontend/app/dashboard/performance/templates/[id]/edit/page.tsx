'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService, CreateTemplateData, TemplateSection, SectionCriteria } from '@/services/performanceService';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateTemplateData>({
        name: '',
        description: '',
        sections: [],
    });

    const { data: template, isLoading } = useQuery({
        queryKey: ['template', id],
        queryFn: () => performanceService.getTemplateById(id),
    });

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                description: template.description || '',
                sections: template.sections.map((s: any) => ({
                    title: s.title,
                    description: s.description || '',
                    weight: s.weight,
                    criteria: s.criteria.map((c: any) => ({
                        name: c.name,
                        description: c.description || '',
                        weight: c.weight,
                        type: c.type,
                    })),
                })),
            });
        }
    }, [template]);

    const updateMutation = useMutation({
        mutationFn: (data: CreateTemplateData) => performanceService.updateTemplate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['template', id] });
            alert('Template updated successfully!');
            router.push('/dashboard/performance/templates');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update template');
        },
    });

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const validateWeights = () => {
        const totalSectionWeight = formData.sections.reduce((sum, s) => sum + s.weight, 0);
        if (totalSectionWeight !== 100) {
            setError(`Total section weights must equal 100%. Current: ${totalSectionWeight}%`);
            return false;
        }

        for (const section of formData.sections) {
            const totalCriteriaWeight = section.criteria.reduce((sum, c) => sum + c.weight, 0);
            if (totalCriteriaWeight !== 100) {
                setError(`Total criteria weights in section "${section.title}" must equal 100%. Current: ${totalCriteriaWeight}%`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (validateWeights()) {
            updateMutation.mutate(formData);
        }
    };

    if (isLoading) return <CircularProgress />;

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
                <Typography variant="h4">Edit Template</Typography>
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
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleBasicChange}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">Sections</Typography>
                        <Button startIcon={<Add />} variant="outlined" onClick={addSection}>
                            Add Section
                        </Button>
                    </Box>

                    {formData.sections.map((section, sIndex) => (
                        <Paper key={sIndex} sx={{ p: 3, mb: 3, position: 'relative' }}>
                            <IconButton
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                color="error"
                                onClick={() => removeSection(sIndex)}
                            >
                                <Delete />
                            </IconButton>

                            <Box mb={3} pr={5}>
                                <Typography variant="subtitle1" gutterBottom color="primary">
                                    Section {sIndex + 1}
                                </Typography>

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

                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle2">Criteria</Typography>
                                    <Button size="small" startIcon={<Add />} onClick={() => addCriteria(sIndex)}>
                                        Add Criteria
                                    </Button>
                                </Box>

                                <Box>
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
                                    {section.criteria.length === 0 && (
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            No criteria added yet.
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                <Box display="flex" justifyContent="flex-end" mb={5}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

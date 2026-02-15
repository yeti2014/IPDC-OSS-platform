/**
 * Entry Services Page (Tier 1)
 * Administrative & Registration Services for New Enterprises
 * AI-Powered Classification (Model 1) + Park Recommendation (Model 3)
 * Adapted from Chinese Smart Park Digital OSS Model
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Home as HomeIcon,
  ChevronRight as ChevronIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  TrendingUp as PriorityIcon,
  Business as BusinessIcon,
  Send as SendIcon,
  Description as FormIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Bolt as PowerIcon,
  Water as WaterIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowIcon,
  Stars as StarsIcon,
  Error as ErrorIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { aiApiClient, ServiceClassificationResponse } from '../services/aiApiService';
import { recommendParks, TenantProfile, ParkRecommendation } from '../services/aiApi';

// Park recommendation constants
const parkSteps = ['Business Profile', 'Requirements', 'AI Recommendations'];
const industrySectors = [
  'textile', 'garment', 'leather', 'food_processing', 'agro_processing',
  'pharmaceutical', 'beverage', 'manufacturing', 'other',
];
const urgencyLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export const EntryServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // ==================== SERVICE APPLICATION STATE (Tab 0) ====================
  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    description: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<ServiceClassificationResponse['data'] | null>(null);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // AI Classification
  const classifyService = useCallback(async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setAiClassification(null);
      setShowAiInsights(false);
      return;
    }

    if (formData.title.trim().length < 5 || formData.description.trim().length < 10) {
      return;
    }

    setAiClassifying(true);

    try {
      const response = await aiApiClient.classifyService({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (response.success) {
        setAiClassification(response.data);
        setShowAiInsights(true);
      }
    } catch (error) {
      console.error('AI classification error:', error);
    } finally {
      setAiClassifying(false);
    }
  }, [formData.title, formData.description]);

  // Debounced AI classification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.onLine) {
        classifyService();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, classifyService]);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!formData.companyName.trim()) errors.push('Company name is required');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.email.trim()) errors.push('Email is required');

    if (errors.length > 0) {
      setFormError(errors.join(', '));
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(
        `Entry Service Application Submitted!\n\n` +
        `Company: ${formData.companyName}\n` +
        `Service Type: ${aiClassification?.service_type_display || 'Not classified'}\n` +
        `Priority: ${aiClassification?.priority?.toUpperCase() || 'Normal'}\n` +
        `Est. Processing: ${aiClassification?.estimated_processing_days || 'TBD'} days\n\n` +
        `An IPDC administrator will contact you shortly.`
      );

      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== PARK RECOMMENDATION STATE (Tab 1) ====================
  const [parkActiveStep, setParkActiveStep] = useState(0);
  const [parkLoading, setParkLoading] = useState(false);
  const [parkError, setParkError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ParkRecommendation[]>([]);
  const [confidence, setConfidence] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [expandedPark, setExpandedPark] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<TenantProfile>({
    company_name: '',
    industry_sector: 'textile',
    employees_count: 100,
    investment_capital_usd: 1000000,
    production_capacity: '5000 units/month',
    export_percentage: 50,
    required_land_hectares: 5,
    power_requirement_mw: 2,
    water_requirement_m3_day: 300,
    preferred_region: '',
    rent_budget_etb_month: 400000,
    lease_duration_years: 10,
    timeline_urgency: 'medium',
  });

  const handleProfileChange = (field: keyof TenantProfile, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setParkError(null);
  };

  const getRecommendations = async () => {
    setParkLoading(true);
    setParkError(null);

    try {
      const response = await recommendParks(profileData);

      if (response.success) {
        setRecommendations(response.data.recommendations);
        setConfidence(response.data.model_confidence);
        setReasoning(response.data.reasoning);
      }
    } catch (err: any) {
      console.error('Park recommendation error:', err);
      setParkError(err.message || 'Failed to get park recommendations');
    } finally {
      setParkLoading(false);
    }
  };

  const handleParkNext = async () => {
    if (parkActiveStep === parkSteps.length - 1) {
      navigate('/dashboard');
      return;
    }

    if (parkActiveStep === 1) {
      if (!profileData.company_name) {
        setParkError('Company name is required');
        return;
      }
      await getRecommendations();
    }

    setParkActiveStep((prev) => prev + 1);
  };

  const handleParkBack = () => {
    setParkActiveStep((prev) => prev - 1);
  };

  const getMatchGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'info';
    if (grade.startsWith('C')) return 'warning';
    return 'default';
  };

  // ==================== RENDER ====================
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<ChevronIcon fontSize="small" />} sx={{ mb: 3 }}>
          <Link href="/dashboard" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="inherit">
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link href="/services" underline="hover" color="inherit">
            Service Request
          </Link>
          <Typography color="text.primary">Entry Services</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BusinessIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'info.main' }} />
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                Entry Services
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tier 1: Administrative & Registration Services for New Enterprises
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>AI-Assisted Services:</strong> Apply for entry services with AI classification, or get AI-powered
              park recommendations to find the best industrial park for your business. No token payment required.
            </Typography>
          </Alert>
        </Paper>

        {/* Tabs */}
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 'bold', py: 2 },
            }}
          >
            <Tab
              icon={<FormIcon />}
              iconPosition="start"
              label="Service Application"
              sx={{ textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.95rem' } }}
            />
            <Tab
              icon={<FactoryIcon />}
              iconPosition="start"
              label="Park Recommendation"
              sx={{ textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.95rem' } }}
            />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* ==================== TAB 0: SERVICE APPLICATION ==================== */}
            {activeTab === 0 && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {formError && <Alert severity="error">{formError}</Alert>}

                  <TextField
                    label="Company Name"
                    value={formData.companyName}
                    onChange={handleChange('companyName')}
                    fullWidth
                    required
                    placeholder="e.g., ABC Manufacturing Co."
                  />

                  <TextField
                    label="Service Request Title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    fullWidth
                    required
                    placeholder="e.g., Investment Permit Application for Textile Factory"
                  />

                  <TextField
                    label="Detailed Description"
                    value={formData.description}
                    onChange={handleChange('description')}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    placeholder="Provide detailed information about your request..."
                  />

                  {/* AI Classification Loading */}
                  {aiClassifying && (
                    <Alert severity="info" icon={<CircularProgress size={20} />}>
                      AI analyzing your request for classification...
                    </Alert>
                  )}

                  {/* AI Insights Panel */}
                  <Collapse in={showAiInsights && !!aiClassification}>
                    {aiClassification && (
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          border: '2px solid',
                          borderColor: 'success.main',
                          bgcolor: 'success.lighter',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LightbulbIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                            AI Service Classification
                          </Typography>
                          <Chip
                            label={`${Math.round(aiClassification.confidence_score * 100)}% confident`}
                            size="small"
                            color="success"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Service:</strong> {aiClassification.service_type_display}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PriorityIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Priority:</strong> {aiClassification.priority.toUpperCase()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ color: 'info.main', fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Est. Processing:</strong> {aiClassification.estimated_processing_days} days
                            </Typography>
                          </Box>
                        </Box>

                        {aiClassification.recommendations && aiClassification.recommendations.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              Recommendations:
                            </Typography>
                            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                              {aiClassification.recommendations.slice(0, 4).map((rec, idx) => (
                                <ListItem key={idx}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={rec}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Paper>
                    )}
                  </Collapse>

                  <TextField
                    label="Contact Person"
                    value={formData.contactPerson}
                    onChange={handleChange('contactPerson')}
                    fullWidth
                    placeholder="Full name"
                  />

                  <TextField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    fullWidth
                    required
                    placeholder="contact@company.com"
                  />

                  <TextField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    fullWidth
                    placeholder="+251 xxx xxx xxx"
                  />

                  {/* Submit Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/services')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                      disabled={submitting}
                      size="large"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            )}

            {/* ==================== TAB 1: PARK RECOMMENDATION ==================== */}
            {activeTab === 1 && (
              <Box>
                {/* Stepper */}
                <Stepper activeStep={parkActiveStep} sx={{ mb: 4 }}>
                  {parkSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Error Alert */}
                {parkError && parkActiveStep !== 2 && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setParkError(null)}>
                    {parkError}
                  </Alert>
                )}

                {/* Step 0: Business Profile */}
                {parkActiveStep === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Tell us about your business
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Provide basic information about your company to help us find the perfect industrial park match.
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Company Name"
                          value={profileData.company_name}
                          onChange={(e) => handleProfileChange('company_name', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          select
                          label="Industry Sector"
                          value={profileData.industry_sector}
                          onChange={(e) => handleProfileChange('industry_sector', e.target.value)}
                        >
                          {industrySectors.map((sector) => (
                            <MenuItem key={sector} value={sector}>
                              {sector.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Number of Employees"
                          value={profileData.employees_count}
                          onChange={(e) => handleProfileChange('employees_count', parseInt(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Investment Capital (USD)"
                          value={profileData.investment_capital_usd}
                          onChange={(e) => handleProfileChange('investment_capital_usd', parseInt(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Production Capacity"
                          value={profileData.production_capacity}
                          onChange={(e) => handleProfileChange('production_capacity', e.target.value)}
                          placeholder="e.g., 10000 units/month"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Export Percentage (%)"
                          value={profileData.export_percentage}
                          onChange={(e) => handleProfileChange('export_percentage', parseInt(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 0, max: 100 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Lease Duration (Years)"
                          value={profileData.lease_duration_years}
                          onChange={(e) => handleProfileChange('lease_duration_years', parseInt(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 1, max: 99 } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 1: Requirements */}
                {parkActiveStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Specify your requirements
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Define your land, power, and budget requirements for accurate matching.
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Required Land (Hectares)"
                          value={profileData.required_land_hectares}
                          onChange={(e) => handleProfileChange('required_land_hectares', parseFloat(e.target.value) || 0)}
                          InputProps={{
                            inputProps: { min: 0.1, step: 0.1 },
                            startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Power Requirement (MW)"
                          value={profileData.power_requirement_mw}
                          onChange={(e) => handleProfileChange('power_requirement_mw', parseFloat(e.target.value) || 0)}
                          InputProps={{
                            inputProps: { min: 0.1, step: 0.1 },
                            startAdornment: <PowerIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Water Requirement (m3/day)"
                          value={profileData.water_requirement_m3_day}
                          onChange={(e) => handleProfileChange('water_requirement_m3_day', parseInt(e.target.value) || 0)}
                          InputProps={{
                            inputProps: { min: 0 },
                            startAdornment: <WaterIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Monthly Rent Budget (ETB)"
                          value={profileData.rent_budget_etb_month}
                          onChange={(e) => handleProfileChange('rent_budget_etb_month', parseInt(e.target.value) || 0)}
                          InputProps={{
                            inputProps: { min: 0 },
                            startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Preferred Region/City"
                          value={profileData.preferred_region}
                          onChange={(e) => handleProfileChange('preferred_region', e.target.value)}
                          placeholder="e.g., Hawassa, Addis Ababa"
                          helperText="Leave empty for no preference"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          select
                          label="Timeline Urgency"
                          value={profileData.timeline_urgency}
                          onChange={(e) => handleProfileChange('timeline_urgency', e.target.value)}
                        >
                          {urgencyLevels.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 2: AI Recommendations */}
                {parkActiveStep === 2 && (
                  <>
                    {parkLoading ? (
                      <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={6}>
                        <CircularProgress size={60} />
                        <Typography variant="h6">Analyzing Ethiopian industrial parks...</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Our AI is matching your profile with {profileData.industry_sector} parks
                        </Typography>
                      </Box>
                    ) : parkError ? (
                      <Alert severity="error" action={
                        <Button color="inherit" size="small" onClick={getRecommendations}>
                          Retry
                        </Button>
                      }>
                        {parkError}
                      </Alert>
                    ) : (
                      <Box>
                        {/* Confidence Banner */}
                        <Alert
                          severity={confidence === 'high' ? 'success' : confidence === 'medium' ? 'info' : 'warning'}
                          icon={<StarsIcon />}
                          sx={{ mb: 3 }}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            AI Confidence: {confidence.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {reasoning}
                          </Typography>
                        </Alert>

                        {/* Recommendations */}
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                          Top {recommendations.length} Recommended Parks
                        </Typography>

                        {recommendations.map((park, index) => (
                          <Card
                            key={park.park_id}
                            elevation={index === 0 ? 8 : 3}
                            sx={{
                              mb: 3,
                              border: index === 0 ? '3px solid' : '1px solid',
                              borderColor: index === 0 ? 'primary.main' : 'divider',
                              position: 'relative',
                            }}
                          >
                            {index === 0 && (
                              <Chip
                                label="BEST MATCH"
                                color="primary"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: -12,
                                  right: 16,
                                  fontWeight: 'bold',
                                }}
                              />
                            )}

                            <CardContent>
                              {/* Park Header */}
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={2}>
                                <Box>
                                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {park.park_name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {park.park_name_amharic}
                                  </Typography>
                                  <Box display="flex" gap={1} mt={1}>
                                    <Chip
                                      icon={<LocationIcon />}
                                      label={`${park.location.city}, ${park.location.region}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Box>
                                </Box>

                                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                  <Chip
                                    label={`${park.match_score}% Match`}
                                    color={getMatchGradeColor(park.match_grade) as any}
                                    sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2 }}
                                  />
                                  <Chip
                                    label={`Grade: ${park.match_grade}`}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Box>
                              </Box>

                              {/* Match Score Bar */}
                              <Box mb={3}>
                                <LinearProgress
                                  variant="determinate"
                                  value={park.match_score}
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: 'grey.200',
                                  }}
                                  color={getMatchGradeColor(park.match_grade) as any}
                                />
                              </Box>

                              {/* Pros */}
                              <Box mb={2}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  Advantages
                                </Typography>
                                <List dense>
                                  {park.pros.slice(0, 3).map((pro, idx) => (
                                    <ListItem key={idx}>
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        <CheckIcon color="success" fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={pro} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>

                              {/* Cons */}
                              {park.cons.length > 0 && park.cons[0] !== 'No significant disadvantages identified' && (
                                <Box mb={2}>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Considerations
                                  </Typography>
                                  <List dense>
                                    {park.cons.map((con, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                          <ErrorIcon color="warning" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={con} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}

                              {/* Cost Summary */}
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.lighter', mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  Estimated Monthly Costs
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Rent</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      ETB {park.costs.rent_etb_month.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Utilities</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      ETB {park.costs.utilities_etb_month.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Total Estimated</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                                      ETB {park.costs.total_estimated_etb_month.toLocaleString()}/month
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Paper>

                              {/* Expandable Details */}
                              <Button
                                size="small"
                                onClick={() => setExpandedPark(expandedPark === park.park_id ? null : park.park_id)}
                                endIcon={
                                  <ExpandMoreIcon
                                    sx={{
                                      transform: expandedPark === park.park_id ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.3s',
                                    }}
                                  />
                                }
                              >
                                {expandedPark === park.park_id ? 'Hide' : 'Show'} Full Details
                              </Button>

                              <Collapse in={expandedPark === park.park_id}>
                                <Box mt={2}>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Infrastructure
                                  </Typography>
                                  <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Chip label={`Power: ${park.infrastructure.power_availability}`} size="small" />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Chip label={`Water: ${park.infrastructure.water_availability}`} size="small" />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Chip label={`Internet: ${park.infrastructure.internet_connectivity}`} size="small" />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                      <Chip label={`Road: ${park.infrastructure.road_access}`} size="small" />
                                    </Grid>
                                  </Grid>

                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Available OSS Services
                                  </Typography>
                                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                                    {park.oss_services.map((service, idx) => (
                                      <Chip key={idx} label={service} size="small" variant="outlined" />
                                    ))}
                                  </Box>

                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Capacity
                                  </Typography>
                                  <Grid container spacing={1}>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography variant="caption" color="text.secondary">Land</Typography>
                                      <Typography variant="body2">{park.available_land_hectares} ha</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography variant="caption" color="text.secondary">Power</Typography>
                                      <Typography variant="body2">{park.power_capacity_mw} MW</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography variant="caption" color="text.secondary">Water</Typography>
                                      <Typography variant="body2">{park.water_capacity_m3_day} m3/day</Typography>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Collapse>

                              {/* Action Button */}
                              <Box mt={2}>
                                <Button
                                  variant={index === 0 ? 'contained' : 'outlined'}
                                  fullWidth
                                  endIcon={<ArrowIcon />}
                                  onClick={() => navigate('/create-request', { state: { parkId: park.park_id, parkName: park.park_name } })}
                                >
                                  Apply to {park.park_name}
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}

                        {/* AI Attribution */}
                        <Box mt={3} p={2} bgcolor="info.lighter" borderRadius={2}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Powered by AI Model 3 - Industrial Park Recommendation Engine
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Analyzed {recommendations.length} parks based on your business profile and requirements
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </>
                )}

                {/* Navigation Buttons */}
                <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
                  <Button
                    disabled={parkActiveStep === 0}
                    onClick={handleParkBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleParkNext}
                    disabled={parkLoading}
                  >
                    {parkActiveStep === parkSteps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EntryServicesPage;

/**
 * Park Recommendation Page
 * AI-powered industrial park matching using Model 3
 * Helps tenants find the best Ethiopian industrial park for their business
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Bolt as PowerIcon,
  Water as WaterIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import { recommendParks, TenantProfile, ParkRecommendation } from '../services/aiApi';
import { useNavigate } from 'react-router-dom';

const steps = ['Business Profile', 'Requirements', 'AI Recommendations'];

const industrySectors = [
  'textile',
  'garment',
  'leather',
  'food_processing',
  'agro_processing',
  'pharmaceutical',
  'beverage',
  'manufacturing',
  'other',
];

const urgencyLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export const ParkRecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Finish
      navigate('/dashboard');
      return;
    }

    if (activeStep === 1) {
      // Validate and get recommendations
      if (!profileData.company_name) {
        setError('Company name is required');
        return;
      }

      await getRecommendations();
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await recommendParks(profileData);

      if (response.success) {
        setRecommendations(response.data.recommendations);
        setConfidence(response.data.model_confidence);
        setReasoning(response.data.reasoning);
      }
    } catch (err: any) {
      console.error('Park recommendation error:', err);
      setError(err.message || 'Failed to get park recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getMatchGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'info';
    if (grade.startsWith('C')) return 'warning';
    return 'default';
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Tell us about your business
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Provide basic information about your company to help us find the perfect industrial park match.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={profileData.company_name}
                  onChange={(e) => handleProfileChange('company_name', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Employees"
                  value={profileData.employees_count}
                  onChange={(e) => handleProfileChange('employees_count', parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Investment Capital (USD)"
                  value={profileData.investment_capital_usd}
                  onChange={(e) => handleProfileChange('investment_capital_usd', parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Production Capacity"
                  value={profileData.production_capacity}
                  onChange={(e) => handleProfileChange('production_capacity', e.target.value)}
                  placeholder="e.g., 10000 units/month"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Export Percentage (%)"
                  value={profileData.export_percentage}
                  onChange={(e) => handleProfileChange('export_percentage', parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
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
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Specify your requirements
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define your land, power, and budget requirements for accurate matching.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Water Requirement (m³/day)"
                  value={profileData.water_requirement_m3_day}
                  onChange={(e) => handleProfileChange('water_requirement_m3_day', parseInt(e.target.value) || 0)}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: <WaterIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preferred Region/City"
                  value={profileData.preferred_region}
                  onChange={(e) => handleProfileChange('preferred_region', e.target.value)}
                  placeholder="e.g., Hawassa, Addis Ababa"
                  helperText="Leave empty for no preference"
                />
              </Grid>

              <Grid item xs={12} md={6}>
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
        );

      case 2:
        if (loading) {
          return (
            <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={6}>
              <CircularProgress size={60} />
              <Typography variant="h6">Analyzing Ethiopian industrial parks...</Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI is matching your profile with {profileData.industry_sector} parks
              </Typography>
            </Box>
          );
        }

        if (error) {
          return (
            <Alert severity="error" action={
              <Button color="inherit" size="small" onClick={getRecommendations}>
                Retry
              </Button>
            }>
              {error}
            </Alert>
          );
        }

        return (
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
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {park.park_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {park.name_amharic}
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
                      ✅ Advantages
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
                        ⚠️ Considerations
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
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      💰 Estimated Monthly Costs
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Rent
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ETB {park.costs.rent_etb_month.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Utilities
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ETB {park.costs.utilities_etb_month.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Total Estimated
                        </Typography>
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
                      {/* Infrastructure */}
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        🏗️ Infrastructure
                      </Typography>
                      <Grid container spacing={1} mb={2}>
                        <Grid item xs={6} sm={3}>
                          <Chip label={`Power: ${park.infrastructure.power_availability}`} size="small" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Chip label={`Water: ${park.infrastructure.water_availability}`} size="small" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Chip label={`Internet: ${park.infrastructure.internet_connectivity}`} size="small" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Chip label={`Road: ${park.infrastructure.road_access}`} size="small" />
                        </Grid>
                      </Grid>

                      {/* OSS Services */}
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        📋 Available OSS Services
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                        {park.oss_services.map((service, idx) => (
                          <Chip key={idx} label={service} size="small" variant="outlined" />
                        ))}
                      </Box>

                      {/* Capacity */}
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        📊 Capacity
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Land
                          </Typography>
                          <Typography variant="body2">
                            {park.available_land_hectares} ha
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Power
                          </Typography>
                          <Typography variant="body2">
                            {park.power_capacity_mw} MW
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Water
                          </Typography>
                          <Typography variant="body2">
                            {park.water_capacity_m3_day} m³/day
                          </Typography>
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
                      onClick={() => navigate(`/create-request`, { state: { parkId: park.park_id, parkName: park.park_name } })}
                    >
                      Apply to {park.park_name}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {/* AI Attribution */}
            <Box mt={3} p={2} bgcolor="#e3f2fd" borderRadius={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                🤖 Powered by AI Model 3 - Industrial Park Recommendation Engine
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Analyzed {recommendations.length} parks based on your business profile and requirements
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box mb={4} textAlign="center">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            🏭 Find Your Perfect Industrial Park
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered matching with Ethiopian industrial parks
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && activeStep !== 2 && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box mb={4}>{renderStepContent()}</Box>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ParkRecommendationPage;

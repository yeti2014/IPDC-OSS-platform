// src/components/tenant/ParkRecommendation.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  TrendingUp as RecommendIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

interface ParkScore {
  parkName: string;
  location: string;
  score: number;
  matchPercentage: number;
  strengths: string[];
  considerations: string[];
  occupancyRate: number;
  tenantCount: number;
}

const industrialParks = [
  { name: 'Hawassa Industrial Park', location: 'Hawassa, SNNPR', occupancyRate: 85, tenantCount: 23, specialization: 'textiles' },
  { name: 'Bole Lemi Industrial Park', location: 'Addis Ababa', occupancyRate: 92, tenantCount: 18, specialization: 'manufacturing' },
  { name: 'Kilinto Industrial Park', location: 'Addis Ababa', occupancyRate: 78, tenantCount: 15, specialization: 'pharmaceuticals' },
  { name: 'Kombolcha Industrial Park', location: 'Kombolcha, Amhara', occupancyRate: 65, tenantCount: 12, specialization: 'textiles' },
  { name: 'Mekelle Industrial Park', location: 'Mekelle, Tigray', occupancyRate: 70, tenantCount: 10, specialization: 'manufacturing' },
];

export const ParkRecommendation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [requirements, setRequirements] = useState({
    industryType: '',
    companySize: '',
    locationPreference: '',
    investmentCapacity: '',
    employeeCount: '',
  });
  const [recommendations, setRecommendations] = useState<ParkScore[]>([]);
  const [showResults, setShowResults] = useState(false);

  const steps = ['Company Details', 'Requirements', 'Recommendations'];

  const industryTypes = [
    { value: 'textiles', label: 'Textiles & Garments' },
    { value: 'manufacturing', label: 'General Manufacturing' },
    { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'food-processing', label: 'Food Processing' },
    { value: 'electronics', label: 'Electronics' },
  ];

  const companySizes = [
    { value: 'small', label: 'Small (1-50 employees)' },
    { value: 'medium', label: 'Medium (51-250 employees)' },
    { value: 'large', label: 'Large (250+ employees)' },
  ];

  const locationPreferences = [
    { value: 'addis-ababa', label: 'Addis Ababa' },
    { value: 'regional', label: 'Regional Cities' },
    { value: 'anywhere', label: 'No Preference' },
  ];

  const investmentLevels = [
    { value: 'low', label: 'Under $500K' },
    { value: 'medium', label: '$500K - $2M' },
    { value: 'high', label: 'Above $2M' },
  ];

  const handleChange = (field: keyof typeof requirements) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequirements({ ...requirements, [field]: e.target.value });
  };

  const calculateRecommendations = () => {
    const scores: ParkScore[] = industrialParks.map((park) => {
      let score = 0;
      const strengths: string[] = [];
      const considerations: string[] = [];

      // Industry type match (40 points)
      if (park.specialization === requirements.industryType) {
        score += 40;
        strengths.push(`Specializes in ${requirements.industryType}`);
      } else {
        score += 20;
        considerations.push('Different industry specialization');
      }

      // Location preference (30 points)
      if (requirements.locationPreference === 'addis-ababa' && park.location.includes('Addis Ababa')) {
        score += 30;
        strengths.push('Located in Addis Ababa');
      } else if (requirements.locationPreference === 'regional' && !park.location.includes('Addis Ababa')) {
        score += 30;
        strengths.push('Located in regional area');
      } else if (requirements.locationPreference === 'anywhere') {
        score += 25;
      } else {
        score += 10;
        considerations.push('Location may not match preference');
      }

      // Occupancy rate (20 points) - lower is better
      if (park.occupancyRate < 75) {
        score += 20;
        strengths.push('High availability of space');
      } else if (park.occupancyRate < 85) {
        score += 15;
      } else {
        score += 5;
        considerations.push('Limited space availability');
      }

      // Company size fit (10 points)
      if (requirements.companySize === 'large' && park.tenantCount < 15) {
        score += 10;
        strengths.push('Suitable for large operations');
      } else if (requirements.companySize === 'medium') {
        score += 8;
      } else {
        score += 6;
      }

      return {
        parkName: park.name,
        location: park.location,
        score,
        matchPercentage: score,
        strengths,
        considerations,
        occupancyRate: park.occupancyRate,
        tenantCount: park.tenantCount,
      };
    });

    scores.sort((a, b) => b.score - a.score);
    setRecommendations(scores);
    setShowResults(true);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      calculateRecommendations();
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setShowResults(false);
    setRequirements({
      industryType: '',
      companySize: '',
      locationPreference: '',
      investmentCapacity: '',
      employeeCount: '',
    });
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return requirements.industryType && requirements.companySize;
    }
    if (activeStep === 1) {
      return requirements.locationPreference && requirements.investmentCapacity;
    }
    return true;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <RecommendIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Find Your Perfect Industrial Park
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get AI-powered recommendations based on your business needs
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {!showResults ? (
          <>
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Industry Type"
                    value={requirements.industryType}
                    onChange={handleChange('industryType')}
                    fullWidth
                    required
                  >
                    {industryTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Company Size"
                    value={requirements.companySize}
                    onChange={handleChange('companySize')}
                    fullWidth
                    required
                  >
                    {companySizes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Expected Employee Count"
                    value={requirements.employeeCount}
                    onChange={handleChange('employeeCount')}
                    fullWidth
                    type="number"
                    placeholder="e.g., 150"
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Location Preference"
                    value={requirements.locationPreference}
                    onChange={handleChange('locationPreference')}
                    fullWidth
                    required
                  >
                    {locationPreferences.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Investment Capacity"
                    value={requirements.investmentCapacity}
                    onChange={handleChange('investmentCapacity')}
                    fullWidth
                    required
                  >
                    {investmentLevels.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {activeStep === steps.length - 2 ? 'Get Recommendations' : 'Next'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Based on your requirements, we've analyzed {industrialParks.length} industrial parks.
                Here are your best matches:
              </Typography>
            </Alert>

            <Grid container spacing={2}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} key={rec.parkName}>
                  <Paper
                    elevation={index === 0 ? 4 : 1}
                    sx={{
                      p: 2,
                      border: index === 0 ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      position: 'relative',
                    }}
                  >
                    {index === 0 && (
                      <Chip
                        label="Best Match"
                        color="primary"
                        size="small"
                        icon={<CheckIcon />}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {index + 1}. {rec.parkName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {rec.location}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Match Score
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {rec.matchPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={rec.matchPercentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Occupancy
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {rec.occupancyRate}%
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon fontSize="small" color="success" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Tenants
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {rec.tenantCount}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" fontWeight="bold" color="success.main">
                        ✓ Strengths:
                      </Typography>
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {rec.strengths.map((strength, idx) => (
                          <Typography key={idx} variant="caption" display="block" color="text.secondary">
                            • {strength}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {rec.considerations.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight="bold" color="warning.main">
                          ⚠ Considerations:
                        </Typography>
                        <Box sx={{ pl: 2, mt: 0.5 }}>
                          {rec.considerations.map((consideration, idx) => (
                            <Typography key={idx} variant="caption" display="block" color="text.secondary">
                              • {consideration}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button onClick={handleReset}>Start Over</Button>
              <Button variant="outlined" onClick={() => window.location.href = '/zones'}>
                View All Parks
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ParkRecommendation;
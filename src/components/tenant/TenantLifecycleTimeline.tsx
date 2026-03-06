/**
 * Tenant Lifecycle Status Timeline
 * Shows progression from new applicant → settled tenant
 * Chinese Smart Park OSS Model
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as PendingIcon,
  Business as EntryIcon,
  Build as FacilityIcon,
  Flag as GoalIcon,
} from '@mui/icons-material';

export interface TenantStatus {
  stage: 'new' | 'applying' | 'approved' | 'settled' | 'active';
  completedServices: {
    investmentPermit?: boolean;
    businessLicense?: boolean;
    workPermit?: boolean;
    taxRegistration?: boolean;
  };
}

interface TenantLifecycleTimelineProps {
  status: TenantStatus;
}

export const TenantLifecycleTimeline: React.FC<TenantLifecycleTimelineProps> = ({ status }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = [
    {
      label: 'New Applicant',
      stage: 'new',
      description: 'Start your IPDC journey',
      services: [],
      icon: <GoalIcon />,
    },
    {
      label: 'Entry Services (Tier 1)',
      stage: 'applying',
      description: 'Administrative & registration services',
      services: [
        { key: 'investmentPermit', label: 'Investment Permit', completed: status.completedServices.investmentPermit },
        { key: 'businessLicense', label: 'Business License', completed: status.completedServices.businessLicense },
        { key: 'workPermit', label: 'Work Permit', completed: status.completedServices.workPermit },
        { key: 'taxRegistration', label: 'Tax Registration', completed: status.completedServices.taxRegistration },
      ],
      icon: <EntryIcon />,
    },
    {
      label: 'Approved',
      stage: 'approved',
      description: 'All admin services completed',
      services: [],
      icon: <CompleteIcon />,
    },
    {
      label: 'Settled in IPDC Premises',
      stage: 'settled',
      description: 'Moved into industrial park',
      services: [],
      icon: <FacilityIcon />,
    },
    {
      label: 'Active Tenant (Tier 2)',
      stage: 'active',
      description: 'Facility management services available',
      services: [],
      icon: <FacilityIcon />,
    },
  ];

  const getActiveStep = () => {
    const stageOrder = ['new', 'applying', 'approved', 'settled', 'active'];
    return stageOrder.indexOf(status.stage);
  };

  const activeStep = getActiveStep();

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" gutterBottom>
        Your Tenant Journey
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your progress from application to active operations
      </Typography>

      <Stepper
        activeStep={activeStep}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        alternativeLabel={!isMobile}
      >
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <Step key={step.label} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isCompleted
                        ? 'success.main'
                        : isActive
                        ? 'primary.main'
                        : 'grey.300',
                      color: 'white',
                    }}
                  >
                    {isCompleted ? <CompleteIcon /> : step.icon}
                  </Box>
                )}
              >
                <Typography variant="subtitle2" fontWeight={isActive ? 'bold' : 'normal'}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>

              {isMobile && step.services.length > 0 && (
                <StepContent>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {step.services.map((service: any) => (
                      <Box
                        key={service.key}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: service.completed
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.grey[500], 0.05),
                        }}
                      >
                        {service.completed ? (
                          <CompleteIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        ) : (
                          <PendingIcon sx={{ fontSize: 18, color: 'grey.400' }} />
                        )}
                        <Typography variant="caption">{service.label}</Typography>
                        {service.completed && (
                          <Chip label="✓" size="small" color="success" sx={{ ml: 'auto', height: 20, minWidth: 20 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </StepContent>
              )}
            </Step>
          );
        })}
      </Stepper>

      {/* Current Status Summary */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2,
          bgcolor: activeStep === steps.length - 1 ? '#e8f5e9' : '#e3f2fd',
          border: '1px solid',
          borderColor: activeStep === steps.length - 1 ? 'success.main' : 'primary.main',
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Current Status:
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={steps[activeStep].label}
            color={activeStep === steps.length - 1 ? 'success' : 'primary'}
            size="small"
          />
          {activeStep === 0 && (
            <Typography variant="caption" color="text.secondary">
              • Submit an Entry Service request to begin your journey
            </Typography>
          )}
          {activeStep === 1 && (
            <Typography variant="caption" color="text.secondary">
              • Entry Services (Tier 1) - AI-assisted, no tokens required
            </Typography>
          )}
          {activeStep === 2 && (
            <Typography variant="caption" color="text.secondary">
              • Entry services completed — awaiting settlement in IPDC premises
            </Typography>
          )}
          {activeStep === 3 && (
            <Typography variant="caption" color="text.secondary">
              • Settled in park — Facility Management (Tier 2) services now available
            </Typography>
          )}
          {activeStep >= 4 && (
            <Typography variant="caption" color="text.secondary">
              • Facility Management (Tier 2) - Token-based services available
            </Typography>
          )}
        </Stack>
      </Paper>
    </Paper>
  );
};

export default TenantLifecycleTimeline;

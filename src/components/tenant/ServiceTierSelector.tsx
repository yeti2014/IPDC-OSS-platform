/**
 * Service Tier Selector
 * Chinese Smart Park Digital OSS Model Implementation
 * Two-Tier Service System: Entry Services (Tier 1) vs Facility Management (Tier 2)
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Business as BusinessIcon,
  Build as BuildIcon,
  AutoAwesome as AIIcon,
  Token as TokenIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

interface ServiceTierSelectorProps {
  onSelectTier: (tier: 'entry' | 'facility') => void;
}

export const ServiceTierSelector: React.FC<ServiceTierSelectorProps> = ({ onSelectTier }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        fontWeight="bold"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}
      >
        Select Service Type
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Tier 1: Entry/Admin Services */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={4}
            sx={{
              height: '100%',
              border: '3px solid',
              borderColor: 'info.main',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: `0 16px 32px ${alpha(theme.palette.info.main, 0.3)}`,
                borderColor: 'info.dark',
                borderWidth: '4px',
              },
            }}
          >
            <CardActionArea
              onClick={() => onSelectTier('entry')}
              sx={{ height: '100%', p: { xs: 2.5, sm: 3.5, md: 4 } }}
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Icon and Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'info.main' }} />
                    </Box>
                    <Chip
                      icon={<AIIcon />}
                      label="AI-Powered"
                      color="info"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Box>

                  {/* Title */}
                  <Box>
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" gutterBottom>
                      Entry Services
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tier 1: Administrative & Registration Services
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: { xs: 'auto', sm: 60 } }}>
                    For <strong>new enterprises</strong> applying to join IPDC industrial parks.
                    AI-assisted classification and guidance.
                  </Typography>

                  {/* Services List */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
                      Available Services:
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                      {[
                        'Investment Permit',
                        'Business License',
                        'Work Permit',
                        'Tax Registration',
                        'Customs Clearance',
                        'More...',
                      ].map((service) => (
                        <Chip
                          key={service}
                          label={service}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            borderColor: 'info.main',
                            color: 'info.main',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Features */}
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon sx={{ fontSize: 16, color: 'info.main' }} />
                      <Typography variant="caption">AI service classification</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon sx={{ fontSize: 16, color: 'info.main' }} />
                      <Typography variant="caption">Processing time estimates</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon sx={{ fontSize: 16, color: 'info.main' }} />
                      <Typography variant="caption">Smart recommendations</Typography>
                    </Box>
                  </Stack>

                  {/* CTA */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" color="info.main">
                      Apply Now
                    </Typography>
                    <ArrowIcon sx={{ color: 'info.main' }} />
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* Tier 2: Facility Management Services */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={4}
            sx={{
              height: '100%',
              border: '3px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                borderColor: 'primary.dark',
                borderWidth: '4px',
              },
            }}
          >
            <CardActionArea
              onClick={() => onSelectTier('facility')}
              sx={{ height: '100%', p: { xs: 2.5, sm: 3.5, md: 4 } }}
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Icon and Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BuildIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'primary.main' }} />
                    </Box>
                    <Chip
                      icon={<TokenIcon />}
                      label="Token-Based"
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Box>

                  {/* Title */}
                  <Box>
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" gutterBottom>
                      Facility Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tier 2: Operational Services for Settled Tenants
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: { xs: 'auto', sm: 60 } }}>
                    For <strong>existing tenants</strong> already located in IPDC premises.
                    Token-based service management system.
                  </Typography>

                  {/* Services List */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
                      Available Services:
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                      {[
                        'Maintenance',
                        'Utilities',
                        'Security',
                        'Cleaning',
                        'IT Support',
                        'More...',
                      ].map((service) => (
                        <Chip
                          key={service}
                          label={service}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Features */}
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TokenIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption">Token credit & deduction</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TokenIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption">Real-time balance tracking</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TokenIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption">Automated service requests</Typography>
                    </Box>
                  </Stack>

                  {/* CTA */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      Create Request
                    </Typography>
                    <ArrowIcon sx={{ color: 'primary.main' }} />
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceTierSelector;

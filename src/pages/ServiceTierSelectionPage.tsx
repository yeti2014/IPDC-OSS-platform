/**
 * Service Tier Selection Page
 * Chinese Smart Park Digital OSS Model
 * Separate entry point for Tier 1 (Entry) vs Tier 2 (Facility) services
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Home as HomeIcon, ChevronRight as ChevronIcon } from '@mui/icons-material';
import ServiceTierSelector from '../components/tenant/ServiceTierSelector';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';

export const ServiceTierSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTierSelection = (tier: 'entry' | 'facility') => {
    if (tier === 'entry') {
      // Navigate to Entry Services form (Tier 1 - Admin services)
      navigate('/services/entry');
    } else {
      // Navigate to Facility Management form (Tier 2 - Token-based)
      navigate('/services/facility');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<ChevronIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            href="/dashboard"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            color="inherit"
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Typography color="text.primary">Service Request</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            IPDC Digital One-Stop Service
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.95,
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            }}
          >
            Industrial Parks Development Corporation - Ethiopia
          </Typography>
        </Paper>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle sx={{ fontWeight: 'bold' }}>Two-Tier Service System</AlertTitle>
          <Typography variant="body2">
            <strong>Entry Services (Tier 1):</strong> For new enterprises applying to join IPDC parks - AI-assisted with administrative guidance
            <br />
            <strong>Facility Management (Tier 2):</strong> For existing tenants already settled in IPDC premises - Token-based operational services
          </Typography>
        </Alert>

        {/* Tier Selector Component */}
        <ServiceTierSelector onSelectTier={handleTierSelection} />

        {/* Footer Help Text */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mt: 4,
            bgcolor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Need Help?</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>New to IPDC?</strong> Choose "Entry Services" to start your application journey
            <br />
            • <strong>Already a tenant?</strong> Choose "Facility Management" for operational support
            <br />
            • <strong>Questions?</strong> Contact IPDC support at support@ipdc.gov.et
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ServiceTierSelectionPage;

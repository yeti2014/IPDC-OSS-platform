/**
 * Parks Map Page
 * Full-page interactive map of Ethiopian IPDC Industrial Parks
 *
 * Adapted from Alibaba Cloud DataV Smart Park Dashboard
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Alert,
  AlertTitle,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  Map as MapIcon,
  Info as InfoIcon,
  Dashboard as DashboardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ParksMap from '../components/map/ParksMap';
import ParkDetailsModal from '../components/map/ParkDetailsModal';
import { IndustrialPark } from '../data/ethiopianParks';

const ParksMapPage: React.FC = () => {
  const [selectedPark, setSelectedPark] = useState<IndustrialPark | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleParkClick = (park: IndustrialPark) => {
    setSelectedPark(park);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Don't clear selectedPark immediately to allow modal animation to complete
    setTimeout(() => setSelectedPark(null), 300);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs and Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Breadcrumbs>
          <Link
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            color="inherit"
            underline="hover"
          >
            <HomeIcon fontSize="small" />
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/dashboard"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            color="inherit"
            underline="hover"
          >
            <DashboardIcon fontSize="small" />
            Dashboard
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <MapIcon fontSize="small" />
            Industrial Parks Map
          </Typography>
        </Breadcrumbs>

        <Button
          component={RouterLink}
          to="/dashboard"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          size="small"
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ethiopian IPDC-OSS Industrial Parks
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Interactive map of all 15 industrial parks managed by the Industrial Parks Development Corporation (IPDC).
          Click on any park marker to view detailed information and apply for services.
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <AlertTitle>How to Use This Map</AlertTitle>
        Use the search and filter options to find parks by industry, region, or status.
        Click on any park marker to view detailed information including available land, infrastructure capacity, and investment incentives.
        The map works offline after the first load.
      </Alert>

      {/* Map Container */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <ParksMap
          onParkClick={handleParkClick}
          selectedPark={selectedPark}
        />
      </Paper>

      {/* Park Details Modal */}
      <ParkDetailsModal
        park={selectedPark}
        open={modalOpen}
        onClose={handleModalClose}
      />

      {/* Footer Info */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Data Source: Ethiopian Industrial Parks Development Corporation (IPDC) • Updated January 2026
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Map Technology: OpenStreetMap • Offline-First Design for Ethiopian Connectivity
        </Typography>
      </Box>
    </Container>
  );
};

export default ParksMapPage;

/**
 * Park Details Modal
 * Displays comprehensive information about a selected industrial park
 *
 * Adapted from Alibaba Cloud DataV Detail Panel
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  IconButton,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  ElectricBolt as PowerIcon,
  Water as WaterIcon,
  LocalAirport as AirportIcon,
  DirectionsBoat as PortIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon,
  LocalOffer as OfferIcon,
  RequestQuote as RequestQuoteIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';
import { IndustrialPark } from '../../data/ethiopianParks';
import { useNavigate } from 'react-router-dom';

interface ParkDetailsModalProps {
  park: IndustrialPark | null;
  open: boolean;
  onClose: () => void;
}

const ParkDetailsModal: React.FC<ParkDetailsModalProps> = ({ park, open, onClose }) => {
  const navigate = useNavigate();

  if (!park) return null;

  const handleApplyForSpace = () => {
    onClose();
    navigate('/create-request', { state: { parkId: park.parkId, parkName: park.name } });
  };

  const handleGetRecommendation = () => {
    onClose();
    navigate('/park-recommendations');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="div">
              {park.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {park.location}, {park.region}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Status Badge */}
          <Box>
            {park.status === 'operational' ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Operational"
                color="success"
                size="medium"
              />
            ) : park.status === 'under_development' ? (
              <Chip
                icon={<ConstructionIcon />}
                label="Under Development"
                color="warning"
                size="medium"
              />
            ) : (
              <Chip
                icon={<BusinessIcon />}
                label="Planned"
                color="default"
                size="medium"
              />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Established: {park.establishedYear}
            </Typography>
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="body1" paragraph>
              {park.description}
            </Typography>
          </Box>

          {/* Focus Industries */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              <BusinessIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
              Focus Industries
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {park.focusIndustries.map(industry => (
                <Chip
                  key={industry}
                  label={industry}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Park Statistics */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Park Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Total Size
                    </Typography>
                    <Typography variant="h6">
                      {park.size} hectares
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Available Land
                    </Typography>
                    <Typography variant="h6" color={park.availableLand > 50 ? 'success.main' : park.availableLand > 0 ? 'warning.main' : 'error.main'}>
                      {park.availableLand} hectares
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {park.status === 'operational' && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Occupancy Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={park.occupancyRate}
                            sx={{ height: 8, borderRadius: 4 }}
                            color={park.occupancyRate > 80 ? 'success' : park.occupancyRate > 50 ? 'warning' : 'error'}
                          />
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {park.occupancyRate}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Infrastructure */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Infrastructure Capacity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PowerIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Power Capacity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {park.powerCapacity.toLocaleString()} KW
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Water Capacity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {park.waterCapacity.toLocaleString()} m³/day
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Logistics */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Logistics & Connectivity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AirportIcon color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Distance to Airport
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {park.distanceToAirport} km
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PortIcon color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Distance to Djibouti Port
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {park.distanceToPort} km
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {park.hasCustomsOffice ? (
                    <>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        On-site Customs Office Available
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No on-site customs office
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Incentives */}
          {park.incentives && park.incentives.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <OfferIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                  Investment Incentives
                </Typography>
                <Stack spacing={1}>
                  {park.incentives.map((incentive, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 18, mt: 0.25 }} />
                      <Typography variant="body2">{incentive}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {/* Contact Information */}
          {(park.contactEmail || park.contactPhone || park.website) && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={1}>
                  {park.contactEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{park.contactEmail}</Typography>
                    </Box>
                  )}
                  {park.contactPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{park.contactPhone}</Typography>
                    </Box>
                  )}
                  {park.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WebsiteIcon fontSize="small" color="action" />
                      <Typography variant="body2">{park.website}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={handleGetRecommendation}
          variant="outlined"
          startIcon={<RecommendIcon />}
          color="secondary"
        >
          Get Recommendations
        </Button>
        <Button
          onClick={handleApplyForSpace}
          variant="contained"
          startIcon={<RequestQuoteIcon />}
          disabled={park.availableLand === 0}
        >
          {park.availableLand > 0 ? 'Apply for Space' : 'No Space Available'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParkDetailsModal;

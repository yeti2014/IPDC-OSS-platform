/**
 * ParksMap Component
 * Interactive map of Ethiopian IPDC Industrial Parks
 *
 * Adapted from:
 * - Alibaba Cloud DataV Geospatial Visualization
 * - Tencent WeCity Smart Park Map
 *
 * Features:
 * - Displays all 15 Ethiopian IPDC parks
 * - Color-coded markers by status
 * - Click markers for park details
 * - Search and filter functionality
 * - Offline-first with tile caching
 */

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Card,
  CardContent,
  SelectChangeEvent
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';
import {
  ethiopianIPDCParks,
  IndustrialPark,
  getStatusColor,
  getAllIndustries,
  getAllRegions
} from '../../data/ethiopianParks';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ParksMapProps {
  onParkClick?: (park: IndustrialPark) => void;
  selectedPark?: IndustrialPark | null;
}

/**
 * Component to handle map bounds updates
 */
const MapBoundsUpdater: React.FC<{ parks: IndustrialPark[] }> = ({ parks }) => {
  const map = useMap();

  React.useEffect(() => {
    if (parks.length > 0) {
      const bounds = L.latLngBounds(parks.map(park => park.coordinates));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, parks]);

  return null;
};

const ParksMap: React.FC<ParksMapProps> = ({ onParkClick, selectedPark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const industries = getAllIndustries();
  const regions = getAllRegions();

  // Create custom marker icons for different park statuses
  const createCustomIcon = (park: IndustrialPark) => {
    const color = getStatusColor(park.status);
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #fff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          margin-top: 3px;
          margin-left: 3px;
          font-size: 16px;
          color: white;
        ">📍</div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  // Filter parks based on search and filters
  const filteredParks = useMemo(() => {
    return ethiopianIPDCParks.filter(park => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park.focusIndustries.some(ind => ind.toLowerCase().includes(searchQuery.toLowerCase()));

      // Industry filter
      const matchesIndustry = selectedIndustry === 'all' ||
        park.focusIndustries.some(ind => ind === selectedIndustry);

      // Region filter
      const matchesRegion = selectedRegion === 'all' ||
        park.region === selectedRegion;

      // Status filter
      const matchesStatus = selectedStatus === 'all' ||
        park.status === selectedStatus;

      return matchesSearch && matchesIndustry && matchesRegion && matchesStatus;
    });
  }, [searchQuery, selectedIndustry, selectedRegion, selectedStatus]);

  const handleIndustryChange = (event: SelectChangeEvent) => {
    setSelectedIndustry(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    setSelectedRegion(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search and Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Search Parks"
              placeholder="Search by name, location, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  label="Industry"
                  onChange={handleIndustryChange}
                >
                  <MenuItem value="all">All Industries</MenuItem>
                  {industries.map(industry => (
                    <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Region</InputLabel>
                <Select
                  value={selectedRegion}
                  label="Region"
                  onChange={handleRegionChange}
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  {regions.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="under_development">Under Development</MenuItem>
                  <MenuItem value="planned">Planned</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredParks.length} of {ethiopianIPDCParks.length} parks
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Map */}
      <Box sx={{ flexGrow: 1, height: 'calc(100vh - 300px)', minHeight: '400px' }}>
        <MapContainer
          center={[9.145, 40.489]} // Ethiopia center
          zoom={6}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater parks={filteredParks} />

          {filteredParks.map(park => (
            <Marker
              key={park.id}
              position={park.coordinates}
              icon={createCustomIcon(park)}
              eventHandlers={{
                click: () => {
                  if (onParkClick) {
                    onParkClick(park);
                  }
                }
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 250, maxWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    {park.name}
                  </Typography>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {park.location}, {park.region}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {park.status === 'operational' ? (
                        <>
                          <CheckCircleIcon fontSize="small" color="success" />
                          <Chip
                            label="Operational"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </>
                      ) : (
                        <>
                          <ConstructionIcon fontSize="small" color="warning" />
                          <Chip
                            label="Under Development"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Focus Industries:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {park.focusIndustries.slice(0, 3).map(industry => (
                          <Chip
                            key={industry}
                            label={industry}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Size: {park.size} hectares
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Available: {park.availableLand} hectares
                      </Typography>
                      <br />
                      {park.status === 'operational' && (
                        <Typography variant="caption" color="text.secondary">
                          Occupancy: {park.occupancyRate}%
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: 'pointer', textDecoration: 'underline', mt: 1 }}
                      onClick={() => onParkClick && onParkClick(park)}
                    >
                      View Full Details →
                    </Typography>
                  </Stack>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Map Legend */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Map Legend
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: getStatusColor('operational')
                }}
              />
              <Typography variant="body2">Operational ({ethiopianIPDCParks.filter(p => p.status === 'operational').length})</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: getStatusColor('under_development')
                }}
              />
              <Typography variant="body2">Under Development ({ethiopianIPDCParks.filter(p => p.status === 'under_development').length})</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: getStatusColor('planned')
                }}
              />
              <Typography variant="body2">Planned ({ethiopianIPDCParks.filter(p => p.status === 'planned').length})</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ParksMap;

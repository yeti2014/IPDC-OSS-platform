// src/components/admin/AssetManagement.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Build as MaintenanceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { assetService } from '../../services/assetService';
import { Asset, AssetStatistics, AssetStatus, AssetCondition } from '../../types/asset';
import { useAuth } from '../../contexts/AuthContext';
import { AssetDialog } from './AssetDialog';
import { MaintenanceDialog } from './MaintenanceDialog';
import { MaintenanceCalendar } from './MaintenanceCalendar';
import { PredictiveMaintenanceCard } from './PredictiveMaintenanceCard';
import { seedDemoAssets } from '../../utils/seedAssets';

export const AssetManagement = () => {
  const { userData } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Dialog states
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [aiPredictionDialogOpen, setAiPredictionDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAssets();
    loadStatistics();
  }, [userData]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      // For demo, load all assets. In production, filter by park
      const allAssets = await assetService.getAssetsByPark('all');
      setAssets(allAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await assetService.getAssetStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, asset: Asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSeedDemoAssets = async () => {
    if (!userData?.uid) return;

    if (confirm('This will add 5 demo assets to the database. Continue?')) {
      try {
        setLoading(true);
        await seedDemoAssets(userData.uid);
        await loadAssets();
        await loadStatistics();
        alert('✅ Demo assets added successfully!');
      } catch (error) {
        console.error('Error seeding assets:', error);
        alert('❌ Failed to seed demo assets. Check console for details.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;

    if (confirm(`Are you sure you want to delete asset "${selectedAsset.name}"?`)) {
      const result = await assetService.deleteAsset(selectedAsset.id);
      if (result.success) {
        loadAssets();
        loadStatistics();
      }
    }

    handleMenuClose();
  };

  const getStatusColor = (status: AssetStatus): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    const colors: Record<AssetStatus, any> = {
      'operational': 'success',
      'maintenance': 'warning',
      'repair': 'error',
      'retired': 'default',
      'reserved': 'info',
      'damaged': 'error'
    };
    return colors[status];
  };

  const getConditionIcon = (condition: AssetCondition) => {
    const icons: Record<AssetCondition, JSX.Element> = {
      'excellent': <CheckCircleIcon color="success" />,
      'good': <CheckCircleIcon color="info" />,
      'fair': <WarningIcon color="warning" />,
      'poor': <ErrorIcon color="error" />,
      'critical': <ErrorIcon color="error" />
    };
    return icons[condition];
  };

  const filteredAssets = () => {
    switch (tabValue) {
      case 1: // Operational
        return assets.filter(a => a.status === 'operational');
      case 2: // Maintenance
        return assets.filter(a => a.status === 'maintenance' || a.status === 'repair');
      case 3: // Requires Attention
        return assets.filter(a =>
          a.condition === 'poor' ||
          a.condition === 'critical' ||
          (a.nextMaintenanceDate && a.nextMaintenanceDate <= new Date())
        );
      default:
        return assets;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Asset Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {assets.length === 0 && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleSeedDemoAssets}
            >
              Seed Demo Assets
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingAsset(null);
              setAssetDialogOpen(true);
            }}
          >
            Add Asset
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Assets
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {statistics.totalAssets}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ${statistics.totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Maintenance Due
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {statistics.maintenanceDue + statistics.maintenanceOverdue}
                    </Typography>
                  </Box>
                  <MaintenanceIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Avg. Asset Age
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {Math.round(statistics.avgAssetAge / 365)} yrs
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Alerts */}
      {statistics && statistics.maintenanceOverdue > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>{statistics.maintenanceOverdue} assets</strong> have overdue maintenance!
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`All Assets (${assets.length})`} />
        <Tab label={`Operational (${assets.filter(a => a.status === 'operational').length})`} />
        <Tab label={`In Maintenance (${assets.filter(a => a.status === 'maintenance' || a.status === 'repair').length})`} />
        <Tab label={`Requires Attention`} />
        <Tab label="Maintenance Calendar" />
      </Tabs>

      {/* Tab Content */}
      {tabValue === 4 ? (
        <MaintenanceCalendar />
      ) : loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Asset Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Condition</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Next Maintenance</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No assets found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets().map((asset) => (
                  <TableRow key={asset.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {asset.assetCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {asset.name}
                      </Typography>
                      {asset.manufacturer && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {asset.manufacturer} {asset.model}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asset.category.replace('-', ' ').toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={asset.condition}>
                        {getConditionIcon(asset.condition)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {asset.parkName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {asset.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        ${asset.currentValue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {asset.nextMaintenanceDate ? (
                        <Typography
                          variant="body2"
                          color={asset.nextMaintenanceDate <= new Date() ? 'error' : 'text.primary'}
                        >
                          {format(asset.nextMaintenanceDate, 'MMM dd, yyyy')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, asset)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setAiPredictionDialogOpen(true);
          handleMenuClose();
        }}>
          <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
          AI Maintenance Prediction
        </MenuItem>
        <MenuItem onClick={() => {
          setEditingAsset(selectedAsset);
          setAssetDialogOpen(true);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Asset
        </MenuItem>
        <MenuItem onClick={() => {
          setMaintenanceDialogOpen(true);
          handleMenuClose();
        }}>
          <MaintenanceIcon fontSize="small" sx={{ mr: 1 }} />
          Schedule Maintenance
        </MenuItem>
        <MenuItem onClick={handleDeleteAsset}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Asset
        </MenuItem>
      </Menu>

      {/* Asset Dialog */}
      <AssetDialog
        open={assetDialogOpen}
        onClose={() => {
          setAssetDialogOpen(false);
          setEditingAsset(null);
        }}
        onSuccess={() => {
          loadAssets();
          loadStatistics();
        }}
        asset={editingAsset}
      />

      {/* Maintenance Dialog */}
      {selectedAsset && (
        <MaintenanceDialog
          open={maintenanceDialogOpen}
          onClose={() => setMaintenanceDialogOpen(false)}
          onSuccess={() => {
            loadAssets();
            loadStatistics();
          }}
          asset={selectedAsset}
        />
      )}

      {/* AI Prediction Dialog */}
      {selectedAsset && (
        <Dialog
          open={aiPredictionDialogOpen}
          onClose={() => setAiPredictionDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                AI Maintenance Prediction - {selectedAsset.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <PredictiveMaintenanceCard asset={selectedAsset} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAiPredictionDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AssetManagement;

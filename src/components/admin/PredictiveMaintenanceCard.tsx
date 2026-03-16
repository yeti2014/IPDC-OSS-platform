/**
 * Predictive Maintenance Card
 * Displays AI-powered maintenance predictions for assets (Model 2)
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Asset } from '../../types/asset';
import { predictMaintenance, MaintenancePredictionResponse } from '../../services/aiApi';
import { format, differenceInDays } from 'date-fns';

interface PredictiveMaintenanceCardProps {
  asset: Asset;
  compact?: boolean;
}

export const PredictiveMaintenanceCard: React.FC<PredictiveMaintenanceCardProps> = ({
  asset,
  compact = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<MaintenancePredictionResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!compact) {
      analyzeMaintenance();
    }
  }, [asset.id]);

  const analyzeMaintenance = async () => {
    setLoading(true);
    setError(null);

    try {
      // Helper to safely convert Firestore Timestamps, strings, or Dates to JS Date
      const toDate = (value: any): Date => {
        if (!value) return new Date();
        if (value instanceof Date) return value;
        if (typeof value?.toDate === 'function') return value.toDate(); // Firestore Timestamp
        const d = new Date(value);
        return isNaN(d.getTime()) ? new Date() : d;
      };

      // Calculate asset age
      const purchaseDate = toDate(asset.purchaseDate);
      const age_days = differenceInDays(new Date(), purchaseDate);

      // Get last maintenance date
      const lastMaintenanceDate = asset.maintenanceHistory?.[0]?.completedDate
        ? toDate(asset.maintenanceHistory[0].completedDate)
        : purchaseDate;

      // Calculate current value with depreciation
      const yearsOld = age_days / 365.25;
      const depreciationMultiplier = Math.pow(1 - (asset.depreciationRate / 100), yearsOld);
      const current_value = asset.purchaseCost * depreciationMultiplier;

      const request = {
        asset_id: asset.id,
        asset_name: asset.name,
        category: asset.category,
        age_days,
        purchase_cost: asset.purchaseCost,
        current_value,
        condition: asset.condition,
        last_maintenance_date: format(lastMaintenanceDate, 'yyyy-MM-dd'),
        maintenance_count: asset.maintenanceHistory?.length || 0,
        maintenance_interval_days: asset.maintenanceInterval || 90,
      };

      const response = await predictMaintenance(request);

      if (response.success) {
        setPrediction(response.data);
      }
    } catch (err: any) {
      console.error('Maintenance prediction error:', err);
      setError(err.message || 'Failed to analyze maintenance needs');
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<TrendingUpIcon />}
        onClick={analyzeMaintenance}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'AI Prediction'}
      </Button>
    );
  }

  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Analyzing asset with AI Model 2...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={analyzeMaintenance}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Button
            variant="contained"
            startIcon={<TrendingUpIcon />}
            onClick={analyzeMaintenance}
            fullWidth
          >
            Run AI Maintenance Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        border: `2px solid ${prediction.risk_color}`,
        background: `linear-gradient(135deg, ${prediction.risk_color}08 0%, transparent 100%)`,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              AI Maintenance Prediction
            </Typography>
          </Box>
          <Chip
            icon={getRiskIcon(prediction.risk_level)}
            label={`${prediction.risk_level.toUpperCase()} RISK`}
            color={getRiskColor(prediction.risk_level) as any}
            size="small"
          />
        </Box>

        {/* Key Metrics */}
        <Box display="flex" flexDirection="column" gap={2} mb={3}>
          {/* Failure Probability */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2" color="text.secondary">
                Failure Probability
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={prediction.risk_color}>
                {(prediction.failure_probability * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={prediction.failure_probability * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${prediction.risk_color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: prediction.risk_color,
                },
              }}
            />
          </Box>

          {/* Days Until Failure */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">Days Until Failure</Typography>
            </Box>
            <Chip
              label={`${prediction.days_until_failure} days`}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Estimated Cost */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <MoneyIcon fontSize="small" color="action" />
              <Typography variant="body2">Estimated Cost</Typography>
            </Box>
            <Chip
              label={`ETB ${prediction.estimated_cost.toLocaleString()}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>

        {/* Recommended Action */}
        <Alert
          severity={prediction.risk_level === 'high' ? 'error' : prediction.risk_level === 'medium' ? 'warning' : 'success'}
          icon={getRiskIcon(prediction.risk_level)}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" fontWeight="bold">
            {prediction.recommended_action}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Priority: {prediction.maintenance_priority}/5 | Urgency: {prediction.urgency}
          </Typography>
        </Alert>

        {/* Expandable Details */}
        <Box>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              />
            }
          >
            {expanded ? 'Hide' : 'Show'} Details
          </Button>

          <Collapse in={expanded}>
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Asset Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Age"
                    secondary={`${prediction.asset_details.age_years} years old`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BuildIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Maintenance"
                    secondary={`${prediction.asset_details.days_since_last_maintenance} days ago`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Maintenance Count"
                    secondary={`${prediction.asset_details.total_maintenance_count} times`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Next Scheduled Maintenance"
                    secondary={format(new Date(prediction.next_maintenance_date), 'PPP')}
                  />
                </ListItem>
              </List>

              <Box mt={2} p={1} bgcolor="#e3f2fd" borderRadius={1}>
                <Typography variant="caption" color="text.secondary">
                  🤖 Powered by AI Model 2 - Predictive Maintenance
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Action Button */}
        {prediction.will_fail_soon && (
          <Box mt={2}>
            <Button
              variant="contained"
              color={prediction.risk_level === 'high' ? 'error' : 'warning'}
              fullWidth
              startIcon={<BuildIcon />}
            >
              Schedule Urgent Maintenance
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictiveMaintenanceCard;

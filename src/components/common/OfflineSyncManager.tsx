// src/components/common/OfflineSyncManager.tsx
// Enhanced offline sync manager with queue status and manual sync controls

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CloudDone as CloudDoneIcon,
  CloudQueue as CloudQueueIcon,
  CloudOff as CloudOffIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  getQueueStatus,
  processQueue,
  clearQueue,
  hasPendingOperations,
} from '../../services/offlineQueue';
import { useTranslation } from 'react-i18next';

export const OfflineSyncManager = () => {
  const { t } = useTranslation();
  const { isOnline } = useOnlineStatus();
  const [queueStatus, setQueueStatus] = useState({
    total: 0,
    byType: { create: 0, update: 0, delete: 0 },
    oldestTimestamp: null as number | null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load queue status
  const loadQueueStatus = async () => {
    try {
      const status = await getQueueStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error('Failed to load queue status:', error);
    }
  };

  useEffect(() => {
    loadQueueStatus();

    // Refresh status every 10 seconds
    const interval = setInterval(loadQueueStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queueStatus.total > 0) {
      handleSync();
    }
  }, [isOnline]);

  const handleSync = async () => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncError(null);

    try {
      const result = await processQueue();

      if (result.failed > 0) {
        setSyncError(`${result.failed} operation(s) failed to sync`);
      } else {
        setLastSyncTime(new Date());
      }

      setSyncProgress(100);
      await loadQueueStatus();
    } catch (error: any) {
      setSyncError(error.message || 'Sync failed');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 1000);
    }
  };

  const handleClearQueue = async () => {
    if (window.confirm('Are you sure you want to clear all pending operations? This cannot be undone.')) {
      try {
        await clearQueue();
        await loadQueueStatus();
        setSyncError(null);
      } catch (error) {
        console.error('Failed to clear queue:', error);
      }
    }
  };

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getSyncStatusColor = () => {
    if (!isOnline) return 'warning';
    if (queueStatus.total === 0) return 'success';
    return 'info';
  };

  const getSyncStatusText = () => {
    if (!isOnline && queueStatus.total === 0) return 'Offline - No pending changes';
    if (!isOnline && queueStatus.total > 0) return `Offline - ${queueStatus.total} pending`;
    if (isSyncing) return 'Syncing...';
    if (queueStatus.total === 0) return 'All synced';
    return `${queueStatus.total} to sync`;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              {isOnline ? (
                queueStatus.total === 0 ? (
                  <CloudDoneIcon sx={{ fontSize: 32, color: 'success.main' }} />
                ) : (
                  <CloudQueueIcon sx={{ fontSize: 32, color: 'info.main' }} />
                )
              ) : (
                <CloudOffIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Offline Sync Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getSyncStatusText()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'warning'}
              size="small"
            />

            <IconButton
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{
                transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {isSyncing && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={syncProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Syncing {syncProgress}%
            </Typography>
          </Box>
        )}

        {syncError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSyncError(null)}>
            {syncError}
          </Alert>
        )}

        {queueStatus.total > 0 && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
            <AlertTitle>Pending Operations</AlertTitle>
            {queueStatus.total} operation{queueStatus.total > 1 ? 's' : ''} waiting to sync.
            {isOnline ? ' Click sync to upload now.' : ' Will sync automatically when online.'}
          </Alert>
        )}

        <Collapse in={showDetails}>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Queue Details
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Chip label="Create" size="small" color="success" />
                </ListItemIcon>
                <ListItemText primary={`${queueStatus.byType.create} pending creations`} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Chip label="Update" size="small" color="info" />
                </ListItemIcon>
                <ListItemText primary={`${queueStatus.byType.update} pending updates`} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Chip label="Delete" size="small" color="error" />
                </ListItemIcon>
                <ListItemText primary={`${queueStatus.byType.delete} pending deletions`} />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Oldest: {formatTimestamp(queueStatus.oldestTimestamp)}
            </Typography>
            {lastSyncTime && (
              <>
                <Typography variant="caption" color="text.secondary">•</Typography>
                <Typography variant="caption" color="text.secondary">
                  Last sync: {formatTimestamp(lastSyncTime.getTime())}
                </Typography>
              </>
            )}
          </Box>
        </Collapse>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={isSyncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={!isOnline || isSyncing || queueStatus.total === 0}
            fullWidth
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>

          <IconButton
            onClick={loadQueueStatus}
            disabled={isSyncing}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>

          {queueStatus.total > 0 && (
            <IconButton
              onClick={handleClearQueue}
              disabled={isSyncing}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OfflineSyncManager;

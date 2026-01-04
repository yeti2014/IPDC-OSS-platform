// src/components/common/SyncStatus.tsx
import React from 'react';
import { 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  LinearProgress,
  Typography,
} from '@mui/material';
import { 
  Sync as SyncIcon, 
  Cloud as CloudIcon, 
  CloudOff as CloudOffIcon,
  CloudDone as CloudDoneIcon,
} from '@mui/icons-material';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SyncStatusProps {
  pendingCount: number;
  isSyncing: boolean;
  syncProgress: number;
  onSync: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  pendingCount,
  isSyncing,
  syncProgress,
  onSync,
}) => {
  const { isOnline } = useOnlineStatus();

  // Offline with no pending changes
  if (!isOnline && pendingCount === 0) {
    return (
      <Tooltip title="Offline - No pending changes">
        <Chip
          icon={<CloudOffIcon />}
          label="Offline"
          color="warning"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  // Offline with pending changes
  if (!isOnline && pendingCount > 0) {
    return (
      <Tooltip title={`${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when online`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<CloudOffIcon />}
            label={`Offline (${pendingCount})`}
            color="warning"
            size="small"
          />
        </Box>
      </Tooltip>
    );
  }

  // Syncing
  if (isSyncing) {
    return (
      <Box sx={{ minWidth: 140 }}>
        <Chip
          icon={<CircularProgress size={16} color="inherit" />}
          label={`Syncing ${Math.round(syncProgress)}%`}
          color="info"
          size="small"
        />
        <LinearProgress 
          variant="determinate" 
          value={syncProgress} 
          sx={{ mt: 0.5, height: 3, borderRadius: 2 }} 
        />
      </Box>
    );
  }

  // Online with pending changes
  if (isOnline && pendingCount > 0) {
    return (
      <Tooltip title={`Click to sync ${pendingCount} pending change${pendingCount > 1 ? 's' : ''}`}>
        <Chip
          icon={<SyncIcon />}
          label={`${pendingCount} to sync`}
          color="warning"
          size="small"
          onClick={onSync}
          clickable
          sx={{ 
            cursor: 'pointer',
            '&:hover': { 
              bgcolor: 'warning.light',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s',
          }}
        />
      </Tooltip>
    );
  }

  // All synced
  return (
    <Tooltip title="All data synced">
      <Chip
        icon={<CloudDoneIcon />}
        label="Synced"
        color="success"
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};

export default SyncStatus;
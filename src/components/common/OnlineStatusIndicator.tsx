import { Chip, Box, Tooltip, Alert, Collapse, IconButton } from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useOnlineStatus, formatOfflineDuration } from '@/hooks/useOnlineStatus';

/**
 * Compact status badge for navigation bar
 */
export function OnlineStatusBadge() {
  const { isOnline, wasOffline, offlineDuration } = useOnlineStatus();

  return (
    <Tooltip
      title={
        isOnline
          ? wasOffline
            ? `Back online after ${formatOfflineDuration(offlineDuration)}`
            : 'Connected to internet'
          : 'No internet connection - Working offline'
      }
    >
      <Chip
        icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
        label={isOnline ? 'Online' : 'Offline'}
        color={isOnline ? 'success' : 'warning'}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          height: '28px',
          '& .MuiChip-icon': {
            fontSize: '16px',
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * Detailed status indicator with icon
 */
export function OnlineStatusIndicator() {
  const { isOnline } = useOnlineStatus();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '4px 12px',
        borderRadius: '6px',
        backgroundColor: isOnline ? 'success.light' : 'warning.light',
        color: isOnline ? 'success.dark' : 'warning.dark',
      }}
    >
      {isOnline ? (
        <CloudDoneIcon sx={{ fontSize: 20 }} />
      ) : (
        <CloudOffIcon sx={{ fontSize: 20 }} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {isOnline ? 'Online' : 'Offline'}
        </Box>
        <Box sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
          {isOnline ? 'All systems connected' : 'Working offline'}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Full-width banner that appears at top when offline
 */
export function OfflineBanner() {
  const { isOnline, wasOffline, offlineDuration } = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // Show banner when offline, or briefly when just came back online
  const showBanner = !isOnline || (wasOffline && !dismissed);
  const isReconnected = isOnline && wasOffline;

  return (
    <Collapse in={showBanner}>
      <Alert
        severity={isOnline ? 'success' : 'warning'}
        icon={isOnline ? <CloudDoneIcon /> : <CloudOffIcon />}
        action={
          isReconnected && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setDismissed(true)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
        sx={{
          borderRadius: 0,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ fontWeight: 600, marginBottom: 0.5 }}>
              {isOnline ? (
                <>🎉 Back Online!</>
              ) : (
                <>⚠️ You're Offline</>
              )}
            </Box>
            <Box sx={{ fontSize: '0.875rem' }}>
              {isOnline ? (
                <>
                  Connection restored after {formatOfflineDuration(offlineDuration)}. 
                  Your data will sync automatically.
                </>
              ) : (
                <>
                  No internet connection. Don't worry - you can continue working. 
                  All changes will sync when you're back online.
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Alert>
    </Collapse>
  );
}

/**
 * Mini status dot (for minimal UI)
 */
export function OnlineStatusDot() {
  const { isOnline } = useOnlineStatus();

  return (
    <Tooltip title={isOnline ? 'Online' : 'Offline'}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isOnline ? 'success.main' : 'warning.main',
          animation: !isOnline ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.5,
            },
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * Connection status with sync info
 */
interface OnlineStatusWithSyncProps {
  isSyncing?: boolean;
  queueSize?: number;
  lastSyncTime?: Date;
}

export function OnlineStatusWithSync({
  isSyncing = false,
  queueSize = 0,
  lastSyncTime,
}: OnlineStatusWithSyncProps) {
  const { isOnline } = useOnlineStatus();

  const getSyncStatus = () => {
    if (!isOnline) {
      return queueSize > 0
        ? `${queueSize} item${queueSize !== 1 ? 's' : ''} queued`
        : 'Offline';
    }
    if (isSyncing) {
      return 'Syncing...';
    }
    if (lastSyncTime) {
      const secondsAgo = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
      if (secondsAgo < 60) {
        return 'Just synced';
      }
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `Synced ${minutesAgo}m ago`;
    }
    return 'Online';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: isOnline ? 'success.light' : 'warning.light',
        border: 1,
        borderColor: isOnline ? 'success.main' : 'warning.main',
      }}
    >
      {isSyncing ? (
        <SyncIcon
          sx={{
            fontSize: 18,
            color: 'primary.main',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      ) : isOnline ? (
        <WifiIcon sx={{ fontSize: 18, color: 'success.main' }} />
      ) : (
        <WifiOffIcon sx={{ fontSize: 18, color: 'warning.main' }} />
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Box
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: isOnline ? 'success.dark' : 'warning.dark',
          }}
        >
          {getSyncStatus()}
        </Box>
        {queueSize > 0 && !isOnline && (
          <Box sx={{ fontSize: '0.75rem', color: 'warning.dark', opacity: 0.8 }}>
            Will sync when online
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Simple text-based status
 */
export function OnlineStatusText() {
  const { isOnline } = useOnlineStatus();

  return (
    <Box
      component="span"
      sx={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: isOnline ? 'success.main' : 'warning.main',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
        }}
      />
      {isOnline ? 'Online' : 'Offline'}
    </Box>
  );
}
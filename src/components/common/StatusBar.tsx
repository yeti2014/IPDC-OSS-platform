
import NotificationBell from './NotificationBell';
// src/components/common/StatusBar.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, Alert, AlertTitle } from '@mui/material';
import { OnlineStatusBadge } from './OnlineStatusIndicator';
import { DeviceModeBadge } from './DeviceModeIndicator';
import SyncStatus from './SyncStatus';
import LanguageSwitcher from './LanguageSwitcher';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { useAuth } from '../../contexts/AuthContext';

export const StatusBar: React.FC = () => {
  const { userData } = useAuth();
  const { pendingSyncCount, isSyncing, syncProgress, handleSync } = useOfflineStorage(
    userData?.uid,
    userData?.role
  );

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              fontSize: { xs: '0.9rem', sm: '1.15rem', md: '1.25rem' },
              minWidth: 0,
            }}
          >
            IPDC Digital Platform
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, alignItems: 'center', flexShrink: 0 }}>
            <NotificationBell />
            <LanguageSwitcher />
            <SyncStatus
              pendingCount={pendingSyncCount}
              isSyncing={isSyncing}
              syncProgress={syncProgress}
              onSync={handleSync}
            />
            <OnlineStatusBadge />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <DeviceModeBadge />
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <Alert 
      severity={isOnline ? "success" : "warning"}
      sx={{ borderRadius: 0 }}
    >
      <AlertTitle>{isOnline ? 'Back Online' : "You're Offline"}</AlertTitle>
      {isOnline 
        ? 'Your connection has been restored. Changes will sync automatically.'
        : 'Working in offline mode. Changes saved locally and will sync when online.'}
    </Alert>
  );
};

export const FloatingStatusIndicators: React.FC = () => {
  const { isDesktop } = useDeviceDetection();
  
  if (!isDesktop) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
      }}
    >
      <OnlineStatusBadge />
      <DeviceModeBadge />
    </Box>
  );
};

import { AppBar, Toolbar, Box, Container, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import {
  OnlineStatusBadge,
  OnlineStatusWithSync,
  OfflineBanner,
} from './OnlineStatusIndicator';
import {
  DeviceModeBadge,
  DeviceInfoDisplay,
  PWAStatusIndicator,
} from './DeviceModeIndicator';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

/**
 * Main status bar with online/offline and device indicators
 * Use this at the top of your app
 */
interface StatusBarProps {
  title?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  isSyncing?: boolean;
  queueSize?: number;
  lastSyncTime?: Date;
}

export function StatusBar({
  title = 'IPDC Platform',
  showMenu = false,
  onMenuClick,
  isSyncing,
  queueSize,
  lastSyncTime,
}: StatusBarProps) {
  const device = useDeviceDetection();

  return (
    <>
      {/* Offline banner - shows at very top when offline */}
      <OfflineBanner />

      {/* Main app bar */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {/* Menu button (mobile) */}
          {showMenu && device.isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* App title */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: device.isMobile ? '1rem' : '1.25rem',
            }}
          >
            {title}
          </Typography>

          {/* Status indicators */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: device.isMobile ? 0.5 : 1,
            }}
          >
            {/* Online/Offline status */}
            <OnlineStatusBadge />

            {/* Device mode (desktop only to save space) */}
            {device.isDesktop && <DeviceModeBadge />}

            {/* PWA indicator */}
            <PWAStatusIndicator />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}

/**
 * Status bar with detailed sync information
 * Use this in admin/operations views where sync status is important
 */
export function StatusBarWithSync({
  title = 'IPDC Platform',
  showMenu = false,
  onMenuClick,
  isSyncing = false,
  queueSize = 0,
  lastSyncTime,
}: StatusBarProps) {
  const device = useDeviceDetection();

  return (
    <>
      <OfflineBanner />

      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {showMenu && device.isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: device.isMobile ? '1rem' : '1.25rem',
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {/* Detailed sync status */}
            {device.isDesktop ? (
              <OnlineStatusWithSync
                isSyncing={isSyncing}
                queueSize={queueSize}
                lastSyncTime={lastSyncTime}
              />
            ) : (
              <OnlineStatusBadge />
            )}

            {device.isDesktop && <DeviceModeBadge />}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}

/**
 * Floating status indicators (alternative layout)
 * Shows indicators in bottom-right corner
 */
export function FloatingStatusIndicators({
  isSyncing,
  queueSize,
  lastSyncTime,
}: Omit<StatusBarProps, 'title' | 'showMenu' | 'onMenuClick'>) {
  const device = useDeviceDetection();

  // Don't show on mobile to avoid blocking content
  if (device.isMobile) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
      }}
    >
      <OnlineStatusWithSync
        isSyncing={isSyncing}
        queueSize={queueSize}
        lastSyncTime={lastSyncTime}
      />
      <DeviceInfoDisplay />
    </Box>
  );
}

/**
 * Compact status footer (for mobile bottom navigation)
 */
export function StatusFooter() {
  const { isOnline } = useOnlineStatus();
  const device = useDeviceDetection();

  // Only show on mobile
  if (!device.isMobile) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 16px',
        backgroundColor: isOnline ? 'success.light' : 'warning.light',
        borderTop: 1,
        borderColor: isOnline ? 'success.main' : 'warning.main',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: isOnline ? 'success.main' : 'warning.main',
          }}
        />
        <span style={{ fontWeight: 600 }}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </Box>
      <span style={{ opacity: 0.8 }}>
        {device.screenWidth} × {device.screenHeight} • {device.isPortrait ? 'Portrait' : 'Landscape'}
      </span>
    </Box>
  );
}

/**
 * Demo page showing all status indicators
 * Use this to test all variants
 */
export function StatusIndicatorsDemo() {
  const { isOnline, wasOffline, offlineDuration } = useOnlineStatus();
  const device = useDeviceDetection();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Status Indicators Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates all available status indicators. Try going offline
        (disconnect internet) or resizing your browser to see them in action.
      </Typography>

      {/* Current Status */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Current Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Box>
            <strong>Network:</strong> {isOnline ? '🟢 Online' : '🔴 Offline'}
            {wasOffline && ` (was offline for ${formatOfflineDuration(offlineDuration)})`}
          </Box>
          <Box>
            <strong>Device:</strong> {device.type} ({device.screenWidth} × {device.screenHeight}px)
          </Box>
          <Box>
            <strong>Orientation:</strong> {device.isPortrait ? 'Portrait' : 'Landscape'}
          </Box>
        </Box>
      </Box>

      {/* Indicator Examples */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            1. Status Badges (compact)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <OnlineStatusBadge />
            <DeviceModeBadge />
            <PWAStatusIndicator />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            2. Detailed Status with Sync
          </Typography>
          <OnlineStatusWithSync
            isSyncing={false}
            queueSize={3}
            lastSyncTime={new Date(Date.now() - 120000)}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            3. Device Info Display
          </Typography>
          <DeviceInfoDisplay />
        </Box>
      </Box>
    </Container>
  );
}

// Re-export for convenience
export { OfflineBanner } from './OnlineStatusIndicator';
export { DeviceDebugInfo } from './DeviceModeIndicator';

function formatOfflineDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

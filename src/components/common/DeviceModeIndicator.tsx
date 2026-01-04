import { Chip, Box, Tooltip } from '@mui/material';
import {
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Computer as ComputerIcon,
  PhoneIphone as PhoneIphoneIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Apple as AppleIcon,
  Android as AndroidIcon,
  ScreenRotation as ScreenRotationIcon,
} from '@mui/icons-material';
import {
  useDeviceDetection,
  getDeviceLabel,
  isPWAInstalled,
  getOSType,
} from '@/hooks/useDeviceDetection';

/**
 * Compact device badge for navigation bar
 */
export function DeviceModeBadge() {
  const device = useDeviceDetection();
  const isPWA = isPWAInstalled();

  const getIcon = () => {
    switch (device.type) {
      case 'mobile':
        return <SmartphoneIcon />;
      case 'tablet':
        return <TabletIcon />;
      case 'desktop':
        return <ComputerIcon />;
    }
  };

  return (
    <Tooltip
      title={
        <>
          <div>{getDeviceLabel(device.type)} Mode</div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            {device.screenWidth} × {device.screenHeight}px
          </div>
          {isPWA && (
            <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
              📱 Running as installed app
            </div>
          )}
        </>
      }
    >
      <Chip
        icon={getIcon()}
        label={getDeviceLabel(device.type)}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          height: '28px',
          borderColor: 'primary.main',
          color: 'primary.main',
          '& .MuiChip-icon': {
            fontSize: '16px',
            color: 'primary.main',
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * Detailed device indicator
 */
export function DeviceModeIndicator() {
  const device = useDeviceDetection();
  const os = getOSType();
  const isPWA = isPWAInstalled();

  const getIcon = () => {
    if (device.type === 'desktop') {
      return <ComputerIcon sx={{ fontSize: 24 }} />;
    }
    
    // For mobile/tablet, show OS-specific icon
    if (os === 'iOS') {
      return <PhoneIphoneIcon sx={{ fontSize: 24 }} />;
    }
    if (os === 'Android') {
      return <PhoneAndroidIcon sx={{ fontSize: 24 }} />;
    }
    
    return device.type === 'tablet' ? (
      <TabletIcon sx={{ fontSize: 24 }} />
    ) : (
      <SmartphoneIcon sx={{ fontSize: 24 }} />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: 'primary.light',
        border: 1,
        borderColor: 'primary.main',
      }}
    >
      {getIcon()}
      
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'primary.dark',
          }}
        >
          {getDeviceLabel(device.type)} Mode
        </Box>
        <Box
          sx={{
            fontSize: '0.75rem',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {device.screenWidth} × {device.screenHeight}
          {device.isPortrait && ' • Portrait'}
          {device.isLandscape && ' • Landscape'}
          {isPWA && ' • PWA'}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Simple icon indicator
 */
export function DeviceModeIcon() {
  const device = useDeviceDetection();

  const getIcon = () => {
    switch (device.type) {
      case 'mobile':
        return <SmartphoneIcon />;
      case 'tablet':
        return <TabletIcon />;
      case 'desktop':
        return <ComputerIcon />;
    }
  };

  return (
    <Tooltip title={`${getDeviceLabel(device.type)} Mode`}>
      <Box
        sx={{
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {getIcon()}
      </Box>
    </Tooltip>
  );
}

/**
 * OS indicator
 */
export function OSIndicator() {
  const os = getOSType();

  const getIcon = () => {
    switch (os) {
      case 'iOS':
      case 'MacOS':
        return <AppleIcon sx={{ fontSize: 16 }} />;
      case 'Android':
        return <AndroidIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  if (!getIcon()) return null;

  return (
    <Tooltip title={`Running on ${os}`}>
      <Chip
        icon={getIcon()}
        label={os}
        size="small"
        variant="outlined"
        sx={{
          height: '24px',
          fontSize: '0.75rem',
          '& .MuiChip-icon': {
            fontSize: '14px',
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * Orientation indicator (for mobile/tablet)
 */
export function OrientationIndicator() {
  const device = useDeviceDetection();

  // Only show for mobile and tablet
  if (device.isDesktop) return null;

  return (
    <Tooltip
      title={`${device.isPortrait ? 'Portrait' : 'Landscape'} orientation`}
    >
      <Chip
        icon={<ScreenRotationIcon />}
        label={device.isPortrait ? 'Portrait' : 'Landscape'}
        size="small"
        variant="outlined"
        sx={{
          height: '24px',
          fontSize: '0.75rem',
          '& .MuiChip-icon': {
            fontSize: '14px',
            transform: device.isLandscape ? 'rotate(90deg)' : 'none',
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * PWA install status indicator
 */
export function PWAStatusIndicator() {
  const isPWA = isPWAInstalled();

  if (!isPWA) return null;

  return (
    <Tooltip title="Running as installed Progressive Web App">
      <Chip
        label="📱 PWA"
        size="small"
        color="success"
        sx={{
          height: '24px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      />
    </Tooltip>
  );
}

/**
 * Combined device and orientation info
 */
export function DeviceInfoDisplay() {
  const device = useDeviceDetection();
  const os = getOSType();
  const isPWA = isPWAInstalled();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <DeviceModeBadge />
      {!device.isDesktop && <OrientationIndicator />}
      <OSIndicator />
      <PWAStatusIndicator />
    </Box>
  );
}

/**
 * Responsive helper text
 */
export function ResponsiveHelperText() {
  const device = useDeviceDetection();

  const getMessage = () => {
    if (device.isMobile) {
      return device.isPortrait
        ? '💡 Tip: Rotate to landscape for better view'
        : '✅ Landscape mode active';
    }
    return null;
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <Box
      sx={{
        padding: '8px 12px',
        backgroundColor: 'info.light',
        color: 'info.dark',
        borderRadius: '6px',
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {message}
    </Box>
  );
}

/**
 * Development mode: Show all device info
 * (Remove in production)
 */
export function DeviceDebugInfo() {
  const device = useDeviceDetection();
  const os = getOSType();
  const isPWA = isPWAInstalled();

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        borderRadius: 2,
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: 300,
      }}
    >
      <Box sx={{ fontWeight: 700, marginBottom: 1 }}>🔧 Device Debug</Box>
      <Box>Type: {device.type}</Box>
      <Box>Screen: {device.screenWidth} × {device.screenHeight}</Box>
      <Box>Orientation: {device.isPortrait ? 'Portrait' : 'Landscape'}</Box>
      <Box>Touch: {device.isTouchDevice ? 'Yes' : 'No'}</Box>
      <Box>OS: {os}</Box>
      <Box>Platform: {device.platform}</Box>
      <Box>PWA: {isPWA ? 'Yes' : 'No'}</Box>
      <Box>User Agent: {navigator.userAgent.substring(0, 50)}...</Box>
    </Box>
  );
}
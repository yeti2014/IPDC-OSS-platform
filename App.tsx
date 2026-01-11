import { ThemeProvider, CssBaseline, Container, Box, Typography, Card, CardContent, Divider, Alert } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './config/theme';
import { StatusBar, FloatingStatusIndicators, DeviceDebugInfo } from './components/common/StatusBar';
import {
  OnlineStatusBadge,
  OnlineStatusIndicator,
  OnlineStatusWithSync,
  OnlineStatusDot,
  OnlineStatusText,
} from './components/common/OnlineStatusIndicator';
import {
  DeviceModeBadge,
  DeviceModeIndicator,
  DeviceModeIcon,
  DeviceInfoDisplay,
  OrientationIndicator,
  PWAStatusIndicator,
  ResponsiveHelperText,
} from './components/common/DeviceModeIndicator';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* Main Status Bar */}
        <StatusBar title="IPDC Digital Platform" />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Success Message */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                mb: 1,
              }}
            >
              🏭 IPDC Digital Platform
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ethiopian Industrial Parks One-Stop Service
            </Typography>
            
            <Alert severity="success" sx={{ mt: 3, mb: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                ✅ Project Setup Successful!
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Week 1, Day 1 Complete • Next: Firebase Configuration
              </Typography>
            </Alert>

            <ResponsiveHelperText />
          </Box>

          {/* Status Indicators Demo */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📡 Online/Offline Status Indicators
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                These indicators show your connection status. Try disconnecting from the internet to see them change!
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Badge (Compact)
                  </Typography>
                  <OnlineStatusBadge />
                </Box>
                
                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Detailed Indicator
                  </Typography>
                  <OnlineStatusIndicator />
                </Box>
                
                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    With Sync Status
                  </Typography>
                  <OnlineStatusWithSync
                    isSyncing={false}
                    queueSize={0}
                    lastSyncTime={new Date()}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Dot (Minimal)
                  </Typography>
                  <OnlineStatusDot />
                </Box>

                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Text Only
                  </Typography>
                  <OnlineStatusText />
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  💡 <strong>Test it:</strong> Disconnect your internet or enable airplane mode to see the offline indicators!
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📱 Device Mode Indicators
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                These show what device type you're using. Try resizing your browser window or rotating your device!
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Badge (Compact)
                  </Typography>
                  <DeviceModeBadge />
                </Box>
                
                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Detailed Indicator
                  </Typography>
                  <DeviceModeIndicator />
                </Box>
                
                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Icon Only
                  </Typography>
                  <DeviceModeIcon />
                </Box>

                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    Orientation
                  </Typography>
                  <OrientationIndicator />
                </Box>

                <Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    PWA Status
                  </Typography>
                  <PWAStatusIndicator />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Complete Device Info
                </Typography>
                <DeviceInfoDisplay />
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  💡 <strong>Test it:</strong> Resize your browser window or rotate your mobile device to see indicators update!
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Feature List */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                ✨ What's Included
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    🎯 Core Features Ready
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>React 18 + TypeScript</li>
                    <li>Material-UI Components</li>
                    <li>PWA Support (Offline-ready)</li>
                    <li>Responsive Design</li>
                    <li>Professional Theme</li>
                  </ul>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    📊 Status Indicators
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Online/Offline Detection</li>
                    <li>Device Type Detection</li>
                    <li>Orientation Detection</li>
                    <li>PWA Install Status</li>
                    <li>Sync Status Tracking</li>
                  </ul>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              📅 Next Steps
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Day 2: Firebase Configuration → Day 3: Routing & Pages → Day 4-5: Requirements Analysis
            </Typography>
          </Box>
        </Container>

        {/* Floating Status (Desktop only) */}
        <FloatingStatusIndicators />

        {/* Debug Info (Development only) */}
        <DeviceDebugInfo />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OperationsDashboard } from './pages/OperationsDashboard';
import { ZonesDashboard } from './pages/ZonesDashboard';
import { ParkManagement } from './pages/ParkManagement';
import { OSSServices } from './pages/OSSServices';
import { ComplaintManagementDashboard } from './pages/ComplaintManagementDashboard';
// Lazy-load to prevent Leaflet from loading at app startup — it crashes mobile browsers
const ParksMapPage = React.lazy(() => import('./pages/ParksMapPage'));
import CreateRequestPage from './pages/CreateRequestPage';
import ServiceTierSelectionPage from './pages/ServiceTierSelectionPage';
import EntryServicesPage from './pages/EntryServicesPage';
import FacilityServicesPage from './pages/FacilityServicesPage';
import { initIndexedDB } from './utils/indexedDB';
import { setupAutoSync } from './services/offlineQueue';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh', p: 3, textAlign: 'center',
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
            Please refresh the page to continue.
          </Typography>
          <Button variant="contained" color="inherit" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { userData, currentUser } = useAuth();

  // Firebase auth succeeded but Firestore profile not yet fetched — show spinner
  // instead of incorrectly redirecting to /login (the race condition white screen)
  if (currentUser && !userData) {
    return (
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', gap: 2,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        }}
      >
        <CircularProgress size={48} sx={{ color: 'white' }} />
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          Loading your profile...
        </Typography>
      </Box>
    );
  }

  return userData ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { userData } = useAuth();

  const getDashboard = () => {
    switch (userData?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'operations':
        return <OperationsDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={userData ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={userData ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            {getDashboard()}
          </PrivateRoute>
        }
      />
      <Route
        path="/zones"
        element={
          <PrivateRoute>
            <ZonesDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/parks"
        element={
          <PrivateRoute>
            <ParkManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/oss-services"
        element={
          <PrivateRoute>
            <OSSServices />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <PrivateRoute>
            <ComplaintManagementDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/parks-map"
        element={
          <PrivateRoute>
            <React.Suspense fallback={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <CircularProgress />
              </Box>
            }>
              <ParksMapPage />
            </React.Suspense>
          </PrivateRoute>
        }
      />
      {/* Park Recommendation is now inside Entry Services (/services/entry) - redirect old URL */}
      <Route path="/park-recommendations" element={<Navigate to="/services/entry" />} />
      <Route
        path="/create-request"
        element={
          <PrivateRoute>
            <CreateRequestPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/services"
        element={
          <PrivateRoute>
            <ServiceTierSelectionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/services/entry"
        element={
          <PrivateRoute>
            <EntryServicesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/services/facility"
        element={
          <PrivateRoute>
            <FacilityServicesPage />
          </PrivateRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/complaints" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Initialize offline data support on app startup
    // Note: Service worker is managed by VitePWA plugin (auto-registered)
    const initializeOfflineSupport = async () => {
      try {
        await initIndexedDB();
        console.log('✅ IndexedDB initialized');

        setupAutoSync();
        console.log('✅ Auto-sync configured');
      } catch (error) {
        console.error('❌ Failed to initialize offline support:', error);
      }
    };

    initializeOfflineSupport();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

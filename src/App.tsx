// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { initIndexedDB } from './utils/indexedDB';
import { setupAutoSync } from './services/offlineQueue';

// ─── Lazy-load ALL page components ───────────────────────────────────────────
// This prevents any page's heavy dependencies (Leaflet, charts, etc.) from
// loading at app startup. Each page only loads when the user navigates to it.
// Named exports need .then(m => ({ default: m.Xxx })) to satisfy React.lazy.
const Login = React.lazy(() =>
  import('./pages/Login').then(m => ({ default: m.Login }))
);
const Signup = React.lazy(() =>
  import('./pages/Signup').then(m => ({ default: m.Signup }))
);
const Dashboard = React.lazy(() =>
  import('./pages/Dashboard').then(m => ({ default: m.Dashboard }))
);
const AdminDashboard = React.lazy(() =>
  import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const OperationsDashboard = React.lazy(() =>
  import('./pages/OperationsDashboard').then(m => ({ default: m.OperationsDashboard }))
);
const ZonesDashboard = React.lazy(() =>
  import('./pages/ZonesDashboard').then(m => ({ default: m.ZonesDashboard }))
);
const ParkManagement = React.lazy(() =>
  import('./pages/ParkManagement').then(m => ({ default: m.ParkManagement }))
);
const OSSServices = React.lazy(() =>
  import('./pages/OSSServices').then(m => ({ default: m.OSSServices }))
);
const ComplaintManagementDashboard = React.lazy(() =>
  import('./pages/ComplaintManagementDashboard').then(m => ({ default: m.ComplaintManagementDashboard }))
);
// These already have default exports
const ParksMapPage = React.lazy(() => import('./pages/ParksMapPage'));
const CreateRequestPage = React.lazy(() => import('./pages/CreateRequestPage'));
const ServiceTierSelectionPage = React.lazy(() => import('./pages/ServiceTierSelectionPage'));
const EntryServicesPage = React.lazy(() => import('./pages/EntryServicesPage'));
const FacilityServicesPage = React.lazy(() => import('./pages/FacilityServicesPage'));

// ─── Loading fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 2,
      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
    }}
  >
    <CircularProgress size={48} sx={{ color: 'white' }} />
    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
      Loading...
    </Typography>
  </Box>
);

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message || String(error) };
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
          {this.state.errorMessage && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.6)', mb: 2, maxWidth: 340,
                wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.7rem',
              }}
            >
              {this.state.errorMessage}
            </Typography>
          )}
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

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// ─── Private Route ────────────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { userData, currentUser } = useAuth();

  // Firebase auth succeeded but Firestore profile not yet fetched — show spinner
  // instead of incorrectly redirecting to /login (race condition white screen)
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

// ─── App Routes ───────────────────────────────────────────────────────────────
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
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={userData ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={userData ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute>{getDashboard()}</PrivateRoute>}
        />
        <Route
          path="/zones"
          element={<PrivateRoute><ZonesDashboard /></PrivateRoute>}
        />
        <Route
          path="/parks"
          element={<PrivateRoute><ParkManagement /></PrivateRoute>}
        />
        <Route
          path="/oss-services"
          element={<PrivateRoute><OSSServices /></PrivateRoute>}
        />
        <Route
          path="/admin/complaints"
          element={<PrivateRoute><ComplaintManagementDashboard /></PrivateRoute>}
        />
        <Route
          path="/parks-map"
          element={<PrivateRoute><ParksMapPage /></PrivateRoute>}
        />
        <Route path="/park-recommendations" element={<Navigate to="/services/entry" />} />
        <Route
          path="/create-request"
          element={<PrivateRoute><CreateRequestPage /></PrivateRoute>}
        />
        <Route
          path="/services"
          element={<PrivateRoute><ServiceTierSelectionPage /></PrivateRoute>}
        />
        <Route
          path="/services/entry"
          element={<PrivateRoute><EntryServicesPage /></PrivateRoute>}
        />
        <Route
          path="/services/facility"
          element={<PrivateRoute><FacilityServicesPage /></PrivateRoute>}
        />
        <Route path="/admin" element={<Navigate to="/admin/complaints" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </React.Suspense>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
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

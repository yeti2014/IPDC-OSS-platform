// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
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
import ParksMapPage from './pages/ParksMapPage';
import CreateRequestPage from './pages/CreateRequestPage';
import ServiceTierSelectionPage from './pages/ServiceTierSelectionPage';
import EntryServicesPage from './pages/EntryServicesPage';
import FacilityServicesPage from './pages/FacilityServicesPage';
import { initIndexedDB } from './utils/indexedDB';
import { setupAutoSync } from './services/offlineQueue';

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
  const { userData } = useAuth();
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
            <ParksMapPage />
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

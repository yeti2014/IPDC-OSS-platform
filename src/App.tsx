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
import { initIndexedDB } from './utils/indexedDB';
import { setupAutoSync, registerBackgroundSync } from './services/offlineQueue';

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
      <Route path="/admin" element={<Navigate to="/admin/complaints" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Initialize offline functionality on app startup
    const initializeOfflineSupport = async () => {
      try {
        // Initialize IndexedDB
        await initIndexedDB();
        console.log('✅ IndexedDB initialized');

        // Setup auto-sync
        setupAutoSync();
        console.log('✅ Auto-sync configured');

        // Register service worker
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register(
              '/service-worker.js',
              { scope: '/' }
            );

            console.log('✅ Service Worker registered:', registration.scope);

            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available, show update notification
                    console.log('🔄 New version available! Please refresh.');
                  }
                });
              }
            });

            // Register background sync if supported
            await registerBackgroundSync();
          } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
          }
        } else {
          console.warn('⚠️ Service Workers not supported in this browser');
        }
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
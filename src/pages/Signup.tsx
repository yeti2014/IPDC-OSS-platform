// src/pages/Signup.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedRole, setSelectedRole] = useState<'tenant' | 'admin' | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if admin already exists in the system
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const adminQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin')
        );
        const snapshot = await getDocs(adminQuery);
        setAdminExists(!snapshot.empty);
      } catch (err) {
        console.error('Error checking admin existence:', err);
        setAdminExists(true); // Assume admin exists on error for security
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdminExists();
  }, []);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a registration type');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate admin setup code
    if (selectedRole === 'admin') {
      if (!formData.adminCode) {
        setError('Please enter the IPDC setup code');
        return;
      }
      if (formData.adminCode !== 'IPDC-ADMIN-2024') {
        setError('Invalid IPDC setup code. Please contact IPDC IT department.');
        return;
      }
    }

    setLoading(true);

    try {
      const role = selectedRole === 'admin' ? 'admin' : 'tenant';
      await signUp(formData.email, formData.password, formData.displayName, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: 'tenant' | 'admin') => {
    setSelectedRole(role);
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        padding: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 4 } }}>
        <Typography variant={isMobile ? 'h5' : 'h3'} component="h1" fontWeight="bold" color="white" gutterBottom>
          IPDC Digital Platform
        </Typography>
        <Typography variant={isMobile ? 'body1' : 'h6'} color="rgba(255,255,255,0.8)">
          One-Stop Service for Industrial Park Investment
        </Typography>
      </Box>

      {/* Role Selection Cards */}
      {!selectedRole && (
        <Container maxWidth="md">
          <Grid container spacing={3}>
            {/* Tenant Registration Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                  border: '3px solid transparent',
                }}
                onClick={() => handleRoleSelect('tenant')}
              >
                <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
                  <BusinessIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Investor / Tenant
                  </Typography>
                  <Chip label="Public Registration" color="success" size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Register as an investor or company to access IPDC industrial park services,
                    submit service requests, and manage your business operations.
                  </Typography>
                  <Box sx={{ textAlign: 'left', bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      What you can do:
                    </Typography>
                    <Typography variant="body2" component="div">
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li>Submit service requests (permits, licenses, etc.)</li>
                        <li>View parks map and get AI recommendations</li>
                        <li>Track request status in real-time</li>
                        <li>File complaints if needed</li>
                      </ul>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 3 }}
                    startIcon={<BusinessIcon />}
                  >
                    Register as Investor
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Initial Admin Setup Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: adminExists ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: adminExists ? 0.7 : 1,
                  '&:hover': adminExists ? {} : {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                  border: '3px solid transparent',
                  bgcolor: adminExists ? 'grey.100' : 'white',
                }}
                onClick={() => !adminExists && handleRoleSelect('admin')}
              >
                <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
                  <AdminIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: adminExists ? 'grey.400' : 'warning.main', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Initial Admin Setup
                  </Typography>
                  {checkingAdmin ? (
                    <CircularProgress size={20} sx={{ mb: 2 }} />
                  ) : adminExists ? (
                    <Chip
                      label="Admin Already Exists"
                      color="default"
                      size="small"
                      icon={<CheckCircleIcon />}
                      sx={{ mb: 2 }}
                    />
                  ) : (
                    <Chip
                      label="One-Time Setup"
                      color="warning"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {adminExists
                      ? 'An administrator account already exists. Additional admin and operations staff accounts can only be created by the existing administrator.'
                      : 'First-time setup for IPDC system administrator. This option is only available when no admin account exists in the system.'
                    }
                  </Typography>
                  {!adminExists && !checkingAdmin && (
                    <Box sx={{ textAlign: 'left', bgcolor: '#fff8e1', p: 2, borderRadius: 2, border: '1px solid #ffe082' }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: '#f57c00' }}>
                        Requirements:
                      </Typography>
                      <Typography variant="body2" component="div">
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                          <li>Valid IPDC staff email address</li>
                          <li>IPDC setup authorization code</li>
                          <li>This is a one-time setup only</li>
                        </ul>
                      </Typography>
                    </Box>
                  )}
                  {adminExists && (
                    <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                      <Typography variant="body2">
                        Contact your existing administrator to create new staff accounts via the Admin Dashboard.
                      </Typography>
                    </Alert>
                  )}
                  <Button
                    variant={adminExists ? 'outlined' : 'contained'}
                    color="warning"
                    size="large"
                    fullWidth
                    sx={{ mt: 3 }}
                    disabled={adminExists || checkingAdmin}
                    startIcon={<AdminIcon />}
                  >
                    {adminExists ? 'Not Available' : 'Setup Admin Account'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Container>
      )}

      {/* Registration Form */}
      {selectedRole && (
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={() => setSelectedRole(null)} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant={isMobile ? 'h6' : 'h5'} component="h1" fontWeight="bold">
                  {selectedRole === 'tenant' ? 'Investor Registration' : 'Initial Admin Setup'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRole === 'tenant'
                    ? 'Create your investor account to access IPDC services'
                    : 'Set up the first administrator account for IPDC platform'
                  }
                </Typography>
              </Box>
              {selectedRole === 'tenant' ? (
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              ) : (
                <AdminIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {selectedRole === 'admin' && (
              <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
                <Typography variant="body2">
                  <strong>Important:</strong> This will create the primary administrator account.
                  After setup, you can create additional admin and operations staff accounts from the Admin Dashboard.
                </Typography>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Full Name"
                value={formData.displayName}
                onChange={handleChange('displayName')}
                fullWidth
                required
                sx={{ mb: 2 }}
                autoComplete="name"
                placeholder={selectedRole === 'tenant' ? 'Company Representative Name' : 'Administrator Name'}
              />

              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                required
                sx={{ mb: 2 }}
                autoComplete="email"
                placeholder={selectedRole === 'tenant' ? 'company@example.com' : 'admin@ipdc.gov.et'}
                helperText={selectedRole === 'admin' ? 'Use your official IPDC email address' : ''}
              />

              {selectedRole === 'admin' && (
                <TextField
                  label="IPDC Setup Authorization Code"
                  value={formData.adminCode}
                  onChange={handleChange('adminCode')}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  placeholder="Enter the setup code provided by IPDC IT"
                  helperText="Contact IPDC IT department if you don't have the code"
                />
              )}

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                fullWidth
                required
                sx={{ mb: 2 }}
                autoComplete="new-password"
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                fullWidth
                required
                sx={{ mb: 3 }}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="contained"
                color={selectedRole === 'admin' ? 'warning' : 'primary'}
                fullWidth
                size="large"
                disabled={loading}
                startIcon={selectedRole === 'tenant' ? <BusinessIcon /> : <AdminIcon />}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : selectedRole === 'tenant' ? (
                  'Create Investor Account'
                ) : (
                  'Setup Administrator Account'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" underline="hover">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </Container>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          Industrial Parks Development Corporation (IPDC) - Ethiopia
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.5)">
          Adapted from China Smart Park One-Stop Service Model
        </Typography>
      </Box>
    </Box>
  );
};

export default Signup;

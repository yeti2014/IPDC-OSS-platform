// src/components/auth/SignUp.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Collapse,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'tenant' | 'admin' | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '', // Secret code for initial admin setup
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (field: string) => (e: any) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const validateForm = (): string | null => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Validate admin setup code
    if (selectedRole === 'admin') {
      if (!formData.adminCode) {
        return 'Please enter the IPDC setup code';
      }
      // Simple validation - in production, use a more secure approach
      if (formData.adminCode !== 'IPDC-ADMIN-2024') {
        return 'Invalid IPDC setup code. Please contact IPDC IT department.';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('Please select a registration type');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const role: UserRole = selectedRole === 'admin' ? 'admin' : 'tenant';
      await signUp(formData.email, formData.password, formData.name, role);
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
        padding: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="white" gutterBottom>
          IPDC Digital Platform
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          One-Stop Service for Industrial Park Investment
        </Typography>
      </Box>

      {/* Role Selection Cards */}
      {!selectedRole && (
        <Grid container spacing={3} sx={{ maxWidth: 900, width: '100%' }}>
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
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
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
                  <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                    <li>Submit service requests (permits, licenses, etc.)</li>
                    <li>View parks map and get AI recommendations</li>
                    <li>Track request status in real-time</li>
                    <li>File complaints if needed</li>
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
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <AdminIcon sx={{ fontSize: 64, color: adminExists ? 'grey.400' : 'warning.main', mb: 2 }} />
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
                {!adminExists && (
                  <Box sx={{ textAlign: 'left', bgcolor: 'warning.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="warning.dark">
                      Requirements:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Valid IPDC staff email address</li>
                      <li>IPDC setup authorization code</li>
                      <li>This is a one-time setup only</li>
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
      )}

      {/* Registration Form */}
      {selectedRole && (
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            maxWidth: 500,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => setSelectedRole(null)} sx={{ mr: 1 }}>
              <ExpandLessIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" component="h1" fontWeight="bold">
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
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={handleChange('name')}
              margin="normal"
              required
              autoFocus
              disabled={loading}
              placeholder={selectedRole === 'tenant' ? 'Company Representative Name' : 'Administrator Name'}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              autoComplete="email"
              disabled={loading}
              placeholder={selectedRole === 'tenant' ? 'company@example.com' : 'admin@ipdc.gov.et'}
              helperText={selectedRole === 'admin' ? 'Use your official IPDC email address' : ''}
            />

            {selectedRole === 'admin' && (
              <TextField
                fullWidth
                label="IPDC Setup Authorization Code"
                value={formData.adminCode}
                onChange={handleChange('adminCode')}
                margin="normal"
                required
                disabled={loading}
                placeholder="Enter the setup code provided by IPDC IT"
                helperText="Contact IPDC IT department if you don't have the code"
              />
            )}

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              autoComplete="new-password"
              disabled={loading}
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
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              margin="normal"
              required
              autoComplete="new-password"
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color={selectedRole === 'admin' ? 'warning' : 'primary'}
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              startIcon={selectedRole === 'tenant' ? <BusinessIcon /> : <AdminIcon />}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : selectedRole === 'tenant' ? (
                'Create Investor Account'
              ) : (
                'Setup Administrator Account'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                fontWeight="bold"
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
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

export default SignUp;
// src/pages/Signup.tsx
import { useState } from 'react';
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
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd as SignupIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as 'tenant' | 'admin' | 'operations',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.displayName, formData.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            IPDC Digital Platform
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Offline-First Service Request Management
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              Sign up to start managing service requests
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
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
              />

              <TextField
                select
                label="Role"
                value={formData.role}
                onChange={handleChange('role')}
                fullWidth
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="tenant">Tenant</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="operations">Operations Staff</MenuItem>
              </TextField>

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                fullWidth
                required
                sx={{ mb: 2 }}
                autoComplete="new-password"
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
                fullWidth
                size="large"
                disabled={loading}
                startIcon={<SignupIcon />}
                sx={{ mb: 2 }}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
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
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Signup;
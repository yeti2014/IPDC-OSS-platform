// src/pages/Login.tsx
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
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { EthiopianDateDisplay } from '../components/EthiopianDateDisplay';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3 }
        }}
      >
        {/* IPDC-OSS Branding */}
        <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 }, position: 'relative' }}>
          <Box
            component="img"
            src="/ipdc-oss-icon.png"
            alt="IPDC-OSS"
            sx={{
              height: { xs: 100, sm: 110, md: 120 },
              width: 'auto',
              mx: 'auto',
              mb: { xs: 1.5, sm: 2 },
              display: 'block'
            }}
          />
          {/* Ethiopian Flag - Top Right Corner */}
          <Box
            component="img"
            src="https://flagcdn.com/w80/et.png"
            srcSet="https://flagcdn.com/w160/et.png 2x"
            alt="Ethiopian Flag"
            sx={{
              position: 'absolute',
              top: { xs: 5, sm: 8, md: 10 },
              right: { xs: '10%', sm: '12%', md: '14%' },
              width: { xs: 20, sm: 25, md: 30 },
              height: 'auto',
              borderRadius: 0.5,
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              zIndex: 10
            }}
          />
          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            color="text.secondary"
            sx={{ px: 1 }}
          >
            Industrial Parks Development Corporation - One-Stop Service
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Offline-First Service Request Management
          </Typography>
        </Box>

        {/* Ethiopian & Gregorian Calendar Display */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <EthiopianDateDisplay variant="compact" />
        </Box>

        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              gutterBottom
              fontWeight="bold"
              textAlign="center"
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Sign in to manage your service requests
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                autoComplete="email"
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
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

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size={isMobile ? 'medium' : 'large'}
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{ mb: 2 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/signup" underline="hover">
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </form>

            <Box
              sx={{
                mt: { xs: 2, sm: 3 },
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'info.lighter',
                borderRadius: 1
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                <strong>Test Accounts:</strong>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                📧 Admin: admin@ipdc.et / Test123!
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                📧 Tenant: tenant@company.com / Test123!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
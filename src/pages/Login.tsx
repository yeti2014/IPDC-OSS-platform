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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.info.main}10 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.info.main}15 0%, transparent 70%)`,
        }
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 3, md: 6 },
            py: { xs: 3, sm: 4, md: 6 },
            px: { xs: 2, sm: 3 },
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Left Panel - Branding & Value Proposition */}
          <Box
            sx={{
              flex: { xs: '0 0 auto', md: '1 1 50%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: { md: 500 }
            }}
          >
            {/* IPDC-OSS Branding */}
            <Box sx={{ position: 'relative', mb: 3, width: '100%', maxWidth: { xs: '90%', sm: 450, md: 520 } }}>
              <Box
                component="img"
                src="/AAAAAAAAAAAAAAAA.png"
                alt="IPDC-OSS"
                sx={{
                  width: '100%',
                  height: 'auto',
                  mb: 2,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </Box>

            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight="bold"
              gutterBottom
              sx={{ color: 'primary.main' }}
            >
              Industrial Parks Development Corporation
            </Typography>

            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              color="text.secondary"
              gutterBottom
              fontWeight="medium"
            >
              Digital One-Stop Service Platform
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, mb: 3, lineHeight: 1.7 }}
            >
              Streamlined service request management powered by AI. Access entry services and facility management through a unified platform.
            </Typography>

            {/* Ethiopian & Gregorian Calendar Display */}
            <Box sx={{ mb: 3 }}>
              <EthiopianDateDisplay variant="compact" />
            </Box>

            {/* Key Features - Chinese Smart Park Style */}
            {!isMobile && !isTablet && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Platform Features:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { icon: '🤖', text: 'AI-Powered Service Classification' },
                    { icon: '🎫', text: 'Token-Based Facility Management' },
                    { icon: '📱', text: 'Offline-First Architecture' },
                    { icon: '🇪🇹', text: 'Ethiopian Calendar Integration' }
                  ].map((feature, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 20 }}>{feature.icon}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Right Panel - Login Form */}
          <Box
            sx={{
              flex: { xs: '0 0 auto', md: '1 1 50%' },
              width: { xs: '100%', sm: 450, md: 480 },
              maxWidth: '100%'
            }}
          >
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
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
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
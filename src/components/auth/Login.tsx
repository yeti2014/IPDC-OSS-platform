/**
 * Login Page - Chinese Smart Park OSS Adapted Layout
 * Split-screen design: Branding panel (left) + Login form (right)
 * Adapted from Alibaba ET / Tencent WeCity portal patterns
 */
import React, { useState } from 'react';
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
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Business as BusinessIcon,
  AutoAwesome as AIIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  CloudOff as OfflineIcon,
  Factory as FactoryIcon,
  Security as SecurityIcon,
  Assessment as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

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

  const features = [
    { icon: <AIIcon />, title: 'AI-Powered Classification', desc: 'Alibaba ET-inspired smart service routing' },
    { icon: <SpeedIcon />, title: 'Predictive Maintenance', desc: 'Huawei FusionPlant-adapted asset management' },
    { icon: <FactoryIcon />, title: 'Park Recommendation', desc: 'Tencent WeCity-inspired park matching' },
    { icon: <OfflineIcon />, title: 'Offline-First PWA', desc: 'Works without internet connectivity' },
    { icon: <LanguageIcon />, title: 'Bilingual Support', desc: 'English and Amharic (አማርኛ)' },
    { icon: <SecurityIcon />, title: 'Role-Based Access', desc: 'Admin, Operations & Tenant portals' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* ==================== LEFT PANEL: BRANDING ==================== */}
      <Box
        sx={{
          flex: isMobile ? 'none' : 1,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          minHeight: isMobile ? 'auto' : '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%),
                              radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* IPDC Logo / Header */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: { xs: 48, md: 64 },
                height: { xs: 48, md: 64 },
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: alpha('#fff', 0.3),
              }}
            >
              <BusinessIcon sx={{ fontSize: { xs: 28, md: 36 } }} />
            </Box>
            <Box>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
                IPDC
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                Industrial Parks Development Corporation
              </Typography>
            </Box>
          </Box>

          <Typography
            variant={isMobile ? 'h5' : 'h3'}
            fontWeight="bold"
            sx={{ mb: 1, lineHeight: 1.2 }}
          >
            Digital One-Stop Shop
          </Typography>
          <Typography
            variant={isMobile ? 'body2' : 'h6'}
            sx={{ opacity: 0.85, mb: 4, fontWeight: 300 }}
          >
            Smart Park Platform adapted from Chinese Digital OSS Model
          </Typography>

          {/* Feature Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
              gap: { xs: 1.5, md: 2 },
              mb: 4,
            }}
          >
            {features.map((feature, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: { xs: 1, md: 1.5 },
                  borderRadius: 1.5,
                  bgcolor: alpha('#fff', 0.08),
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.1),
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: alpha('#fff', 0.12) },
                }}
              >
                <Box sx={{ color: '#64b5f6', mt: 0.3, fontSize: 20 }}>
                  {React.cloneElement(feature.icon, { fontSize: 'small' })}
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="bold" display="block">
                    {feature.title}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                      {feature.desc}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Technology badges */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['React + TypeScript', 'Firebase', 'FastAPI', 'XGBoost', 'LightGBM'].map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.12),
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 24,
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.2),
                }}
              />
            ))}
          </Stack>

          {/* Footer attribution */}
          <Typography
            variant="caption"
            sx={{ opacity: 0.5, mt: 4, display: 'block' }}
          >
            Adapted from Alibaba ET Industrial Brain, Huawei FusionPlant & Tencent WeCity
          </Typography>
        </Box>
      </Box>

      {/* ==================== RIGHT PANEL: LOGIN FORM ==================== */}
      <Box
        sx={{
          flex: isMobile ? 'none' : '0 0 480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4 },
          bgcolor: 'background.default',
          minHeight: isMobile ? 'auto' : '100vh',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LoginIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access IPDC Digital OSS Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              disabled={loading}
              size="medium"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/signup')}
                fontWeight="bold"
              >
                Sign up
              </Link>
            </Typography>
          </Box>

          {/* Demo credentials (dev only) */}
          {import.meta.env.DEV && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'info.lighter',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <Typography variant="caption" display="block" fontWeight="bold" gutterBottom>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Admin: admin@ipdc.et / TestPassword123!
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Tenant: tenant@ipdc.et / TestPassword123!
              </Typography>
            </Paper>
          )}

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block', textAlign: 'center', mt: 4 }}
          >
            IPDC Digital OSS Platform v2.0 - Ethiopia
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;

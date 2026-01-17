// src/components/admin/CreateStaffAccount.tsx
/**
 * Admin Staff Account Creation Component
 * Inspired by Chinese Smart Park platforms (Tencent WeCity, Alibaba Cloud)
 *
 * Security Features:
 * - Only accessible by admin role
 * - Phone number verification (Ethiopian format: +251-XXX-XXX-XXX)
 * - Cannot create tenant accounts (tenant self-register only)
 * - Audit logging for accountability
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface CreateStaffFormData {
  name: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'operations';
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

export const CreateStaffAccount: React.FC = () => {
  const { userData } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const [formData, setFormData] = useState<CreateStaffFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'operations',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const steps = ['Staff Information', 'Phone Verification', 'Create Account'];

  // Ethiopian phone number validation (+251-XXX-XXX-XXX or 09XX-XXX-XXX)
  const validatePhoneNumber = (phone: string): boolean => {
    const ethiopianPhoneRegex = /^(\+251|0)[97]\d{8}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return ethiopianPhoneRegex.test(cleanPhone);
  };

  const handleChange = (field: keyof CreateStaffFormData) => (e: any) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError('');
  };

  const validateStep = (step: number): string | null => {
    if (step === 0) {
      if (!formData.name || !formData.email || !formData.phoneNumber) {
        return 'Please fill in all fields';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return 'Please enter a valid email address';
      }

      if (!validatePhoneNumber(formData.phoneNumber)) {
        return 'Please enter a valid Ethiopian phone number (e.g., +251912345678 or 0912345678)';
      }
    }

    if (step === 1) {
      if (!verificationSent) {
        return 'Please send verification code first';
      }
      if (!formData.verificationCode) {
        return 'Please enter verification code';
      }
      if (formData.verificationCode !== generatedCode) {
        return 'Invalid verification code';
      }
    }

    if (step === 2) {
      if (!formData.password || !formData.confirmPassword) {
        return 'Please fill in password fields';
      }
      if (formData.password.length < 6) {
        return 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
    }

    return null;
  };

  // Simulate SMS verification (in production, integrate with SMS gateway like Twilio)
  const handleSendVerification = () => {
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid Ethiopian phone number');
      return;
    }

    setLoading(true);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    // Simulate SMS delay
    setTimeout(() => {
      setVerificationSent(true);
      setLoading(false);
      setSuccess(`Verification code sent to ${formData.phoneNumber}`);

      // In development, show the code in console
      console.log(`📱 SMS Verification Code for ${formData.phoneNumber}: ${code}`);

      // Show code in alert for testing (remove in production)
      alert(`🔐 Development Mode - Verification Code: ${code}\n\nIn production, this will be sent via SMS.`);
    }, 1500);
  };

  const handleNext = () => {
    const validationError = validateStep(activeStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSuccess('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
    setSuccess('');
  };

  const handleCreateAccount = async () => {
    const validationError = validateStep(2);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('👤 Creating staff account...');

      // Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, { displayName: formData.name });

      // Create Firestore user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: formData.name,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userData?.uid,
        createdByName: userData?.displayName || userData?.email,
        verificationMethod: 'phone',
        isStaff: true,
      });

      // Create audit log
      await addDoc(collection(db, 'auditLogs'), {
        action: 'staff_account_created',
        targetUserId: userCredential.user.uid,
        targetUserEmail: formData.email,
        targetUserRole: formData.role,
        performedBy: userData?.uid,
        performedByName: userData?.displayName || userData?.email,
        performedByRole: userData?.role,
        phoneNumber: formData.phoneNumber,
        timestamp: Timestamp.now(),
        metadata: {
          verificationMethod: 'phone',
        },
      });

      console.log('✅ Staff account created successfully');

      setSuccess(
        `✅ ${formData.role === 'admin' ? 'Admin' : 'Operations'} account created successfully!\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phoneNumber}\n` +
        `Role: ${formData.role.toUpperCase()}`
      );

      // Reset form after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (err: any) {
      console.error('❌ Error creating staff account:', err);

      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered in the system');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      role: 'operations',
      password: '',
      confirmPassword: '',
      verificationCode: '',
    });
    setError('');
    setSuccess('');
    setVerificationSent(false);
    setGeneratedCode('');
  };

  // Only allow admin to access this component
  if (userData?.role !== 'admin') {
    return (
      <Alert severity="error" icon={<SecurityIcon />}>
        <Typography variant="body2">
          <strong>Access Denied</strong>
          <br />
          Only administrators can create staff accounts.
        </Typography>
      </Alert>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={() => setOpen(true)}
        size="large"
      >
        Create Staff Account
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonAddIcon color="primary" />
            <Box>
              <Typography variant="h6">Create Staff Account</Typography>
              <Typography variant="caption" color="text.secondary">
                Admin and Operations staff only
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Step 0: Staff Information */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
                autoFocus
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                disabled={loading}
                helperText="This will be used for login"
              />

              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                required
                disabled={loading}
                placeholder="+251912345678 or 0912345678"
                helperText="Ethiopian phone number for verification"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth required>
                <InputLabel>Staff Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Staff Role"
                  onChange={handleChange('role')}
                  disabled={loading}
                >
                  <MenuItem value="admin">Admin (IPDC Staff)</MenuItem>
                  <MenuItem value="operations">Operations (Maintenance Staff)</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Security Notice:</strong>
                  <br />
                  Staff accounts require phone verification. A 6-digit code will be sent to the provided phone number.
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Step 1: Phone Verification */}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Verify Phone Number:</strong> {formData.phoneNumber}
                </Typography>
              </Alert>

              {!verificationSent ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PhoneIcon />}
                  onClick={handleSendVerification}
                  disabled={loading}
                  fullWidth
                  size="large"
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                </Button>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    value={formData.verificationCode}
                    onChange={handleChange('verificationCode')}
                    required
                    placeholder="Enter 6-digit code"
                    inputProps={{ maxLength: 6 }}
                    helperText="Enter the 6-digit code sent to your phone"
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSendVerification}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Step 2: Set Password */}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Phone Verified!</strong>
                  <br />
                  Now set a password for the new staff account.
                </Typography>
              </Alert>

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                required
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
                required
                disabled={loading}
              />

              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Account Summary
                </Typography>
                <Typography variant="body2">Name: {formData.name}</Typography>
                <Typography variant="body2">Email: {formData.email}</Typography>
                <Typography variant="body2">Phone: {formData.phoneNumber}</Typography>
                <Typography variant="body2">
                  Role: {formData.role === 'admin' ? 'Admin (IPDC Staff)' : 'Operations (Maintenance Staff)'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleCreateAccount}
              disabled={loading}
              color="success"
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateStaffAccount;

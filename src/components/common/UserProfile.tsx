// src/components/common/UserProfile.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  Typography,
  Grid,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationPreferences } from './NotificationPreferences';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ open, onClose }) => {
  const { userData, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile data
  const [profileData, setProfileData] = useState({
    displayName: '',
    companyName: '',
    phoneNumber: '',
    email: ''
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (open && userData) {
      setProfileData({
        displayName: userData.displayName || '',
        companyName: userData.companyName || '',
        phoneNumber: userData.phoneNumber || '',
        email: userData.email || ''
      });
      setAvatarPreview(userData.photoURL || '');
    }
  }, [open, userData]);

  const handleProfileChange = (field: keyof typeof profileData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordChange = (field: keyof typeof passwordData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !userData) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let photoURL = userData.photoURL;

      // Upload avatar if changed
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: photoURL || undefined
      });

      // Update email if changed
      if (profileData.email !== userData.email) {
        await updateEmail(user, profileData.email);
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        companyName: profileData.companyName,
        phoneNumber: profileData.phoneNumber,
        email: profileData.email,
        photoURL: photoURL,
        updatedAt: serverTimestamp()
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updatePassword(user, passwordData.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log in again before changing your password');
      } else {
        setError(err.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={avatarPreview}
            sx={{ width: 56, height: 56 }}
          >
            {profileData.displayName?.[0] || userData?.email?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">Profile Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              {userData?.role?.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Notifications" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Avatar Upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 120, height: 120 }}
              >
                {profileData.displayName?.[0] || userData?.email?.[0]}
              </Avatar>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CameraIcon />}
                size="small"
              >
                Change Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarSelect}
                />
              </Button>
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={profileData.displayName}
                  onChange={handleProfileChange('displayName')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange('email')}
                  required
                  helperText="Changing email will require re-authentication"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={profileData.companyName}
                  onChange={handleProfileChange('companyName')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange('phoneNumber')}
                  placeholder="+251-XXX-XXX-XXX"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              Password must be at least 6 characters long
            </Alert>

            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange('newPassword')}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
            />

            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loading || !passwordData.newPassword}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <NotificationPreferences />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {tabValue === 0 && (
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile;

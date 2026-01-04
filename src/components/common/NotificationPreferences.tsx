// src/components/common/NotificationPreferences.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { notificationService } from '../../services/notificationService';
import { NotificationPreferences as NotificationPrefsType, NotificationType } from '../../types/notification';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [preferences, setPreferences] = useState<NotificationPrefsType | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const prefs = await notificationService.getUserPreferences(user.uid);
      setPreferences(prefs);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !preferences) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const result = await notificationService.updateUserPreferences(user.uid, preferences);

      if (result.success) {
        setSuccess('Notification preferences saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, emailNotifications: checked });
  };

  const handleNotificationTypeChange = (type: NotificationType, checked: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      notificationTypes: {
        ...preferences.notificationTypes,
        [type]: checked
      }
    });
  };

  const handleQuietHoursChange = (checked: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      quietHoursEnabled: checked,
      quietHoursStart: checked ? (preferences.quietHoursStart || '22:00') : undefined,
      quietHoursEnd: checked ? (preferences.quietHoursEnd || '08:00') : undefined
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!preferences) {
    return <Alert severity="error">Failed to load notification preferences</Alert>;
  }

  const notificationTypes: { value: NotificationType; label: string; description: string }[] = [
    {
      value: 'request_created',
      label: 'Request Created',
      description: 'When you create a new service request'
    },
    {
      value: 'request_assigned',
      label: 'Request Assigned',
      description: 'When your request is assigned to a team member'
    },
    {
      value: 'request_status_changed',
      label: 'Status Changed',
      description: 'When your request status is updated'
    },
    {
      value: 'request_completed',
      label: 'Request Completed',
      description: 'When your request is marked as completed'
    },
    {
      value: 'token_low_balance',
      label: 'Low Token Balance',
      description: 'When your token balance is running low'
    },
    {
      value: 'token_allocated',
      label: 'Token Allocated',
      description: 'When tokens are added to your account'
    },
    {
      value: 'announcement',
      label: 'Announcements',
      description: 'Platform announcements and updates'
    },
    {
      value: 'maintenance_scheduled',
      label: 'Maintenance Scheduled',
      description: 'Scheduled maintenance notifications'
    },
    {
      value: 'system_alert',
      label: 'System Alerts',
      description: 'Important system notifications'
    }
  ];

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <NotificationsIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Email Notification Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage how you receive email notifications
              </Typography>
            </Box>
          </Box>

          {/* Master Email Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailNotifications}
                onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="600">
                  Enable Email Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Receive email notifications for platform events
                </Typography>
              </Box>
            }
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Notification Types */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Notification Types
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose which types of notifications you want to receive
          </Typography>

          <FormGroup>
            {notificationTypes.map((type) => (
              <FormControlLabel
                key={type.value}
                control={
                  <Switch
                    checked={preferences.notificationTypes[type.value] !== false}
                    onChange={(e) => handleNotificationTypeChange(type.value, e.target.checked)}
                    disabled={!preferences.emailNotifications}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {type.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 1.5, alignItems: 'flex-start' }}
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          {/* Email Digest Frequency */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Email Frequency
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Delivery Preference</InputLabel>
            <Select
              value={preferences.emailDigest}
              label="Delivery Preference"
              onChange={(e) => setPreferences({ ...preferences, emailDigest: e.target.value as any })}
              disabled={!preferences.emailNotifications}
            >
              <MenuItem value="immediate">Immediate (Send emails right away)</MenuItem>
              <MenuItem value="daily">Daily Digest (Once per day)</MenuItem>
              <MenuItem value="weekly">Weekly Digest (Once per week)</MenuItem>
              <MenuItem value="never">Never (Disable all emails)</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Quiet Hours */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Quiet Hours
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Don't send email notifications during specific hours
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.quietHoursEnabled}
                onChange={(e) => handleQuietHoursChange(e.target.checked)}
                disabled={!preferences.emailNotifications}
                color="primary"
              />
            }
            label="Enable Quiet Hours"
            sx={{ mb: 2 }}
          />

          {preferences.quietHoursEnabled && (
            <Box sx={{ display: 'flex', gap: 2, pl: 4 }}>
              <TextField
                label="Start Time"
                type="time"
                value={preferences.quietHoursStart || '22:00'}
                onChange={(e) => setPreferences({ ...preferences, quietHoursStart: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min intervals
              />
              <TextField
                label="End Time"
                type="time"
                value={preferences.quietHoursEnd || '08:00'}
                onChange={(e) => setPreferences({ ...preferences, quietHoursEnd: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationPreferences;

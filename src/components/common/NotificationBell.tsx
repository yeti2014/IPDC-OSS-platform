// src/components/common/NotificationBell.tsx
import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { userData } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userData?.uid);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string, read: boolean) => {
    if (!read) {
      markAsRead(notificationId);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge
          badgeContent={unreadCount}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#FFC107',
              color: '#000',
            }
          }}
        >
          <NotificationsIcon sx={{ color: unreadCount > 0 ? '#FFC107' : 'inherit' }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        {[
          <Box key="header" sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Box>,
          <Divider key="divider" />,
          notifications.length === 0 ? (
            <Box key="empty" sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, notification.read)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 1.5,
                gap: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {!notification.read && (
                  <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                )}
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                  primaryTypographyProps={{
                    fontWeight: notification.read ? 'normal' : 'bold',
                    fontSize: '0.875rem',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}>
                <Chip
                  label={notification.type}
                  size="small"
                  color={getNotificationColor(notification.type)}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                </Typography>
              </Box>
            </MenuItem>
          ))
          ),
          notifications.length > 10 && (
            <Divider key="more-divider" />
          ),
          notifications.length > 10 && (
            <Box key="more-text" sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Showing 10 of {notifications.length} notifications
              </Typography>
            </Box>
          )
        ].filter(Boolean)}
      </Menu>
    </>
  );
};

export default NotificationBell;
// src/components/common/EmptyState.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Box
        sx={{
          fontSize: 80,
          color: 'text.disabled',
          mb: 2,
        }}
      >
        {icon || <InboxIcon fontSize="inherit" />}
      </Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
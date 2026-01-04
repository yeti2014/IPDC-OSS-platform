// src/components/common/LoadingSkeleton.tsx
import React from 'react';
import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

export const RequestSkeleton: React.FC = () => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const RequestListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <RequestSkeleton key={index} />
      ))}
    </Stack>
  );
};

export default RequestSkeleton;
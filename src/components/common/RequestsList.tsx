// src/components/common/RequestsList.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ReportProblem as ComplaintIcon,
} from '@mui/icons-material';
import { ServiceRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface RequestsListProps {
  requests: ServiceRequest[];
  onViewRequest: (request: ServiceRequest) => void;
  onFileComplaint?: (request: ServiceRequest) => void;
  emptyMessage?: string;
}

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'info',
  'in-progress': 'info',
  completed: 'success',
  rejected: 'error',
};

const priorityColors: Record<string, string> = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const serviceTypeIcons: Record<string, string> = {
  maintenance: '🔧',
  utilities: '💡',
  security: '🔒',
  cleaning: '🧹',
  'it-support': '💻',
  'waste-management': '♻️',
  other: '📋',
};

export const RequestsList: React.FC<RequestsListProps> = ({
  requests,
  onViewRequest,
  onFileComplaint,
  emptyMessage = 'No service requests found',
}) => {
  const { userData } = useAuth();
  console.log('🎨 RequestsList rendering with', requests.length, 'requests');

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            {emptyMessage}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {requests.map((request, index) => {
        console.log('📄 Rendering request:', index, request.id, request.title);

        // Check if complaint can be filed (for completed or rejected requests by tenants)
        const canFileComplaint =
          userData?.role === 'tenant' &&
          (request.status === 'completed' || request.status === 'rejected') &&
          onFileComplaint;

        return (
          <Card key={request.id} sx={{ '&:hover': { boxShadow: 4 }, transition: 'all 0.2s' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {serviceTypeIcons[request.serviceType] || '📋'} {request.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {request.description && request.description.length > 150
                      ? `${request.description.substring(0, 150)}...`
                      : request.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      label={request.status.replace('-', ' ').toUpperCase()}
                      color={statusColors[request.status]}
                      size="small"
                    />
                    <Chip
                      label={request.priority.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: priorityColors[request.priority],
                        color: 'white',
                      }}
                    />
                    {request.location && (
                      <Typography variant="caption" color="text.secondary">
                        📍 {request.location}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      🕐 {new Date(request.createdAt).toLocaleDateString()}
                    </Typography>
                    {canFileComplaint && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<ComplaintIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileComplaint(request);
                        }}
                        sx={{ ml: 'auto' }}
                      >
                        File Complaint
                      </Button>
                    )}
                  </Box>
                </Box>

                <Tooltip title="View Details">
                  <IconButton
                    color="primary"
                    onClick={() => onViewRequest(request)}
                    sx={{ ml: 2 }}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

export default RequestsList;

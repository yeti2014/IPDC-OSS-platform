// src/pages/CreateRequestPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import CreateRequestForm from '../components/tenant/CreateRequestForm';

export const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { parkId, parkName } = location.state || {};

  const handleClose = () => {
    navigate('/parks-map');
  };

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Apply for Industrial Park Space
        </Typography>
        {parkName && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Selected Park: <strong>{parkName}</strong>
          </Typography>
        )}
        <Box sx={{ mt: 3 }}>
          <CreateRequestForm
            open={true}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateRequestPage;

// src/components/common/RequestsFilter.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { RequestStatus, RequestPriority, ServiceType } from '../../types';

interface RequestsFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  status: RequestStatus | 'all';
  priority: RequestPriority | 'all';
  serviceType: ServiceType | 'all';
}

export const RequestsFilter: React.FC<RequestsFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    serviceType: 'all',
  });

  const handleChange = (field: keyof FilterState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const newFilters = { ...filters, [field]: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      search: '',
      status: 'all',
      priority: 'all',
      serviceType: 'all',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = 
    (filters.search ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.serviceType !== 'all' ? 1 : 0);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search requests..."
          value={filters.search}
          onChange={handleChange('search')}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status} label="Status" onChange={handleChange('status')}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filters.priority} label="Priority" onChange={handleChange('priority')}>
            <MenuItem value="all">All Priority</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Service Type</InputLabel>
          <Select value={filters.serviceType} label="Service Type" onChange={handleChange('serviceType')}>
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="utilities">Utilities</MenuItem>
            <MenuItem value="security">Security</MenuItem>
            <MenuItem value="cleaning">Cleaning</MenuItem>
            <MenuItem value="it-support">IT Support</MenuItem>
            <MenuItem value="waste-management">Waste Management</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>

        {activeFilterCount > 0 && (
          <Chip
            label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
            onDelete={clearFilters}
            color="primary"
            size="small"
          />
        )}
      </Box>
    </Box>
  );
};

export default RequestsFilter;
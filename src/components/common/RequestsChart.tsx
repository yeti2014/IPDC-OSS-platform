// src/components/common/RequestsChart.tsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ServiceRequest } from '../../types';

interface RequestsChartProps {
  requests: ServiceRequest[];
}

const COLORS = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  'in-progress': '#8b5cf6',
  completed: '#059669',
  rejected: '#ef4444',
};

const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

export const RequestsChart: React.FC<RequestsChartProps> = ({ requests }) => {
  // Status distribution
  const statusData = [
    { name: 'Pending', value: requests.filter((r) => r.status === 'pending').length, color: COLORS.pending },
    { name: 'Approved', value: requests.filter((r) => r.status === 'approved').length, color: COLORS.approved },
    { name: 'In Progress', value: requests.filter((r) => r.status === 'in-progress').length, color: COLORS['in-progress'] },
    { name: 'Completed', value: requests.filter((r) => r.status === 'completed').length, color: COLORS.completed },
    { name: 'Rejected', value: requests.filter((r) => r.status === 'rejected').length, color: COLORS.rejected },
  ].filter((item) => item.value > 0);

  // Priority distribution
  const priorityData = [
    { name: 'Low', value: requests.filter((r) => r.priority === 'low').length, color: PRIORITY_COLORS.low },
    { name: 'Medium', value: requests.filter((r) => r.priority === 'medium').length, color: PRIORITY_COLORS.medium },
    { name: 'High', value: requests.filter((r) => r.priority === 'high').length, color: PRIORITY_COLORS.high },
    { name: 'Urgent', value: requests.filter((r) => r.priority === 'urgent').length, color: PRIORITY_COLORS.urgent },
  ].filter((item) => item.value > 0);

  // Service type distribution
  const serviceTypeData = [
    { name: 'Maintenance', value: requests.filter((r) => r.serviceType === 'maintenance').length },
    { name: 'Utilities', value: requests.filter((r) => r.serviceType === 'utilities').length },
    { name: 'Security', value: requests.filter((r) => r.serviceType === 'security').length },
    { name: 'Cleaning', value: requests.filter((r) => r.serviceType === 'cleaning').length },
    { name: 'IT Support', value: requests.filter((r) => r.serviceType === 'it-support').length },
    { name: 'Waste Mgmt', value: requests.filter((r) => r.serviceType === 'waste-management').length },
    { name: 'Other', value: requests.filter((r) => r.serviceType === 'other').length },
  ].filter((item) => item.value > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Status Distribution Pie Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Request Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Type Bar Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Requests by Service Type
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2563eb" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Priority Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" name="Requests">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequestsChart;
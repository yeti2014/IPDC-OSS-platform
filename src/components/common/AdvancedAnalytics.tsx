// src/components/common/AdvancedAnalytics.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ServiceRequest } from '../../types';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { PDFExport } from './PDFExport';

interface AdvancedAnalyticsProps {
  requests: ServiceRequest[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ requests }) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');

  // Filter requests based on time range
  const filteredRequests = useMemo(() => {
    const now = new Date();
    const ranges = {
      '7days': subDays(now, 7),
      '30days': subDays(now, 30),
      '90days': subDays(now, 90),
      'year': subDays(now, 365)
    };

    return requests.filter(req => req.createdAt >= ranges[timeRange]);
  }, [requests, timeRange]);

  // 1. Requests Over Time (Line Chart)
  const requestsOverTime = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const dateRange = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return dateRange.map(date => {
      const dateStr = format(date, 'MMM dd');
      const dayRequests = filteredRequests.filter(
        req => format(req.createdAt, 'MMM dd') === dateStr
      );

      return {
        date: dateStr,
        total: dayRequests.length,
        pending: dayRequests.filter(r => r.status === 'pending').length,
        completed: dayRequests.filter(r => r.status === 'completed').length,
        inProgress: dayRequests.filter(r => r.status === 'in-progress').length
      };
    });
  }, [filteredRequests, timeRange]);

  // 2. Status Distribution (Pie Chart)
  const statusDistribution = useMemo(() => {
    const statuses = ['pending', 'approved', 'in-progress', 'completed', 'rejected'];
    return statuses.map(status => ({
      name: status.replace('-', ' ').toUpperCase(),
      value: filteredRequests.filter(r => r.status === status).length,
      percentage: ((filteredRequests.filter(r => r.status === status).length / filteredRequests.length) * 100).toFixed(1)
    }));
  }, [filteredRequests]);

  // 3. Service Type Distribution (Bar Chart)
  const serviceTypeDistribution = useMemo(() => {
    const types = ['maintenance', 'utilities', 'security', 'cleaning', 'it-support', 'waste-management', 'other'];
    return types.map(type => ({
      name: type.replace('-', ' ').toUpperCase(),
      count: filteredRequests.filter(r => r.serviceType === type).length,
      avgCompletionTime: calculateAvgCompletionTime(filteredRequests.filter(r => r.serviceType === type))
    }));
  }, [filteredRequests]);

  // 4. Priority Analysis (Radar Chart)
  const priorityAnalysis = useMemo(() => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities.map(priority => ({
      priority: priority.toUpperCase(),
      count: filteredRequests.filter(r => r.priority === priority).length,
      completed: filteredRequests.filter(r => r.priority === priority && r.status === 'completed').length,
      pending: filteredRequests.filter(r => r.priority === priority && r.status === 'pending').length
    }));
  }, [filteredRequests]);

  // 5. Top Performing Metrics
  const performanceMetrics = useMemo(() => {
    const completed = filteredRequests.filter(r => r.status === 'completed');
    const avgCompletionTime = calculateAvgCompletionTime(completed);
    const completionRate = ((completed.length / filteredRequests.length) * 100).toFixed(1);

    return {
      totalRequests: filteredRequests.length,
      completionRate: parseFloat(completionRate),
      avgCompletionTime,
      mostRequestedService: getMostRequestedService(filteredRequests),
      peakRequestDay: getPeakRequestDay(filteredRequests),
      tokenSpent: filteredRequests.reduce((sum, req) => sum + (req.tokenCost || 0), 0)
    };
  }, [filteredRequests]);

  // 6. Tenant Leaderboard (Top 5)
  const tenantLeaderboard = useMemo(() => {
    const tenantStats = new Map<string, { name: string; count: number; completed: number }>();

    filteredRequests.forEach(req => {
      if (!tenantStats.has(req.tenantId)) {
        tenantStats.set(req.tenantId, {
          name: req.tenantName,
          count: 0,
          completed: 0
        });
      }

      const stats = tenantStats.get(req.tenantId)!;
      stats.count++;
      if (req.status === 'completed') stats.completed++;
    });

    return Array.from(tenantStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRequests]);

  // Helper functions
  function calculateAvgCompletionTime(requests: ServiceRequest[]): number {
    const completed = requests.filter(r => r.completedAt);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, req) => {
      const duration = req.completedAt!.getTime() - req.createdAt.getTime();
      return sum + duration;
    }, 0);

    return Math.round((totalTime / completed.length) / (1000 * 60 * 60)); // Convert to hours
  }

  function getMostRequestedService(requests: ServiceRequest[]): string {
    const serviceCounts = new Map<string, number>();
    requests.forEach(req => {
      serviceCounts.set(req.serviceType, (serviceCounts.get(req.serviceType) || 0) + 1);
    });

    let maxCount = 0;
    let mostRequested = 'N/A';
    serviceCounts.forEach((count, service) => {
      if (count > maxCount) {
        maxCount = count;
        mostRequested = service;
      }
    });

    return mostRequested.replace('-', ' ').toUpperCase();
  }

  function getPeakRequestDay(requests: ServiceRequest[]): string {
    const dayCounts = new Map<string, number>();
    requests.forEach(req => {
      const day = format(req.createdAt, 'EEEE');
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    let maxCount = 0;
    let peakDay = 'N/A';
    dayCounts.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        peakDay = day;
      }
    });

    return peakDay;
  }

  return (
    <Box>
      {/* Time Range Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Advanced Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <PDFExport
            type="analytics"
            analyticsData={{
              requests: filteredRequests,
              timeRange: timeRange === '7days' ? 'Last 7 Days' : timeRange === '30days' ? 'Last 30 Days' : timeRange === '90days' ? 'Last 90 Days' : 'Last Year'
            }}
            variant="contained"
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {performanceMetrics.totalRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {performanceMetrics.completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg. Completion Time
              </Typography>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {performanceMetrics.avgCompletionTime}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tokens Spent
              </Typography>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {performanceMetrics.tokenSpent.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Requests Over Time */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Requests Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={requestsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total" />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Completed" />
                  <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#ffc658" fill="#ffc658" name="In Progress" />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#ff7c7c" fill="#ff7c7c" name="Pending" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Type Distribution */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Service Type Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceTypeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Total Requests" />
                  <Bar dataKey="avgCompletionTime" fill="#82ca9d" name="Avg. Completion (hrs)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Priority Analysis</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={priorityAnalysis}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="priority" />
                  <PolarRadiusAxis />
                  <Radar name="Total" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="Completed" dataKey="completed" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Radar name="Pending" dataKey="pending" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tenant Leaderboard */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top 5 Active Tenants</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Tenant Name</TableCell>
                      <TableCell align="right">Total Requests</TableCell>
                      <TableCell align="right">Completed</TableCell>
                      <TableCell align="right">Completion Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenantLeaderboard.map((tenant, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            color={index === 0 ? 'success' : index === 1 ? 'info' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell align="right">{tenant.count}</TableCell>
                        <TableCell align="right">{tenant.completed}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(tenant.completed / tenant.count) * 100}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">
                              {((tenant.completed / tenant.count) * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Key Insights</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Most Requested Service</Typography>
                  <Typography variant="h6" fontWeight="bold">{performanceMetrics.mostRequestedService}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Peak Request Day</Typography>
                  <Typography variant="h6" fontWeight="bold">{performanceMetrics.peakRequestDay}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Average Response Time</Typography>
                  <Typography variant="h6" fontWeight="bold">{performanceMetrics.avgCompletionTime} hours</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedAnalytics;

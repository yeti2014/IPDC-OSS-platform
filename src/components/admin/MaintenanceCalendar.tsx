// src/components/admin/MaintenanceCalendar.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
  Badge,
  Alert
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon,
  CheckCircle as CompletedIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { maintenanceAutomationService } from '../../services/maintenanceAutomationService';
import { MaintenanceRecord, MaintenanceStatus } from '../../types/asset';

export const MaintenanceCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaintenanceData();
  }, [currentMonth]);

  const loadMaintenanceData = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const records = await maintenanceAutomationService.getMaintenanceCalendar(start, end);
      setMaintenanceRecords(records);
    } catch (error) {
      console.error('Error loading maintenance calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
    setSelectedDate(null);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getMaintenanceForDate = (date: Date): MaintenanceRecord[] => {
    return maintenanceRecords.filter(record =>
      isSameDay(record.scheduledDate, date)
    );
  };

  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" fontSize="small" />;
      case 'overdue':
        return <WarningIcon color="error" fontSize="small" />;
      default:
        return <MaintenanceIcon color="primary" fontSize="small" />;
    }
  };

  const getStatusColor = (status: MaintenanceStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const allDays = [...emptyDays, ...calendarDays];

  const selectedDateMaintenance = selectedDate ? getMaintenanceForDate(selectedDate) : [];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={handleToday}>
                    Today
                  </Button>
                  <IconButton size="small" onClick={handlePrevMonth}>
                    <PrevIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleNextMonth}>
                    <NextIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Weekday headers */}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Grid item xs={12 / 7} key={day}>
                    <Typography variant="caption" fontWeight="bold" align="center" display="block" color="text.secondary">
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar grid */}
              <Grid container spacing={1}>
                {allDays.map((day, index) => {
                  if (!day) {
                    return <Grid item xs={12 / 7} key={`empty-${index}`} />;
                  }

                  const maintenanceForDay = getMaintenanceForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasOverdue = maintenanceForDay.some(m => m.status === 'overdue');

                  return (
                    <Grid item xs={12 / 7} key={day.toISOString()}>
                      <Box
                        onClick={() => setSelectedDate(day)}
                        sx={{
                          minHeight: 80,
                          p: 1,
                          border: 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: isToday ? 'primary.50' : isSelected ? 'primary.100' : 'background.paper',
                          '&:hover': {
                            bgcolor: 'grey.50',
                            borderColor: 'primary.light'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography
                            variant="body2"
                            fontWeight={isToday ? 'bold' : 'normal'}
                            color={!isSameMonth(day, currentMonth) ? 'text.disabled' : 'text.primary'}
                          >
                            {format(day, 'd')}
                          </Typography>
                          {maintenanceForDay.length > 0 && (
                            <Badge
                              badgeContent={maintenanceForDay.length}
                              color={hasOverdue ? 'error' : 'primary'}
                              max={9}
                            />
                          )}
                        </Box>

                        {/* Show first 2 maintenance items */}
                        {maintenanceForDay.slice(0, 2).map((maintenance, idx) => (
                          <Chip
                            key={maintenance.id}
                            label={maintenance.title.substring(0, 15)}
                            size="small"
                            color={getStatusColor(maintenance.status)}
                            sx={{
                              fontSize: '0.65rem',
                              height: 18,
                              mb: 0.5,
                              display: 'block',
                              '& .MuiChip-label': {
                                px: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Date Details */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
              </Typography>

              {selectedDate && selectedDateMaintenance.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No maintenance scheduled for this date
                </Alert>
              )}

              {selectedDate && selectedDateMaintenance.length > 0 && (
                <List>
                  {selectedDateMaintenance.map((maintenance) => (
                    <ListItem
                      key={maintenance.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        display: 'block',
                        p: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                          {getStatusIcon(maintenance.status)}
                        </ListItemIcon>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {maintenance.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {maintenance.assetName} ({maintenance.assetCode})
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip
                          label={maintenance.type.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={maintenance.priority.toUpperCase()}
                          size="small"
                          color={
                            maintenance.priority === 'urgent' ? 'error' :
                            maintenance.priority === 'high' ? 'warning' : 'default'
                          }
                        />
                        <Chip
                          label={maintenance.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(maintenance.status)}
                        />
                      </Box>

                      {maintenance.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {maintenance.description}
                        </Typography>
                      )}

                      {maintenance.isRecurring && (
                        <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          🔄 Recurring ({maintenance.recurrencePattern})
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  This Month Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Scheduled:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {maintenanceRecords.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Completed:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {maintenanceRecords.filter(m => m.status === 'completed').length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Overdue:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {maintenanceRecords.filter(m => m.status === 'overdue').length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaintenanceCalendar;

import { useEffect, useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { CalendarMonth, Public } from '@mui/icons-material';
import { formatDualCalendar, getCurrentEthiopianDate, getEthiopianHoliday, formatEthiopianDateAmharic, toAmharicNumerals } from '../utils/ethiopianCalendar';

interface EthiopianDateDisplayProps {
  variant?: 'full' | 'compact';
  showGreeting?: boolean;
}

export const EthiopianDateDisplay = ({
  variant = 'compact',
  showGreeting = false
}: EthiopianDateDisplayProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const ethDate = getCurrentEthiopianDate();
  const holiday = getEthiopianHoliday(currentDate);
  const dualDate = formatDualCalendar(currentDate, {
    showDayOfWeek: variant === 'full',
    showAmharic: true
  });
  const amharicDate = formatEthiopianDateAmharic(ethDate);

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            icon={<CalendarMonth sx={{ fontSize: 16 }} />}
            label={currentDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip
            icon={<Public sx={{ fontSize: 16 }} />}
            label={amharicDate}
            size="small"
            sx={{
              fontSize: '0.8rem',
              bgcolor: 'success.lighter',
              color: 'success.dark',
              borderColor: 'success.main',
              fontFamily: '"Noto Sans Ethiopic", "Nyala", sans-serif',
              '& .MuiChip-label': {
                fontFamily: '"Noto Sans Ethiopic", "Nyala", sans-serif'
              }
            }}
          />
        </Box>
        {holiday && (
          <Typography
            variant="caption"
            sx={{
              color: 'warning.main',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
          >
            🎉 {holiday}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        textAlign: 'center',
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
        <CalendarMonth color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Today's Date
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {dualDate}
      </Typography>

      {holiday && (
        <Chip
          label={holiday}
          color="warning"
          size="small"
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  );
};

export default EthiopianDateDisplay;

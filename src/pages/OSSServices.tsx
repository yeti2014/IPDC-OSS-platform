// src/pages/OSSServices.tsx
import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  LocalShipping as LocalShippingIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { useAuth } from '../contexts/AuthContext';
import { OSS_SERVICE_METADATA, OSSServiceMetadata } from '../types/ossServices';
import { useTranslation } from 'react-i18next';

const categoryIcons = {
  permits: <DescriptionIcon />,
  licensing: <BusinessIcon />,
  registration: <BusinessIcon />,
  facilitation: <DescriptionIcon />,
  customs: <LocalShippingIcon />,
  financial: <AccountBalanceIcon />,
};

export const OSSServices = () => {
  const { t, i18n } = useTranslation();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const services = Object.values(OSS_SERVICE_METADATA).filter((service) => service.enabled);

  const categories = [
    { value: 'all', label: 'All Services', labelAm: 'ሁሉም አገልግሎቶች' },
    { value: 'permits', label: 'Permits', labelAm: 'ፈቃዶች' },
    { value: 'licensing', label: 'Licensing', labelAm: 'ፈቃድ መስጠት' },
    { value: 'registration', label: 'Registration', labelAm: 'ምዝገባ' },
    { value: 'facilitation', label: 'Facilitation', labelAm: 'አመቻቸት' },
    { value: 'customs', label: 'Customs', labelAm: 'ጉምሩክ' },
    { value: 'financial', label: 'Financial', labelAm: 'የፋይናንስ' },
  ];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((service) => service.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, any> = {
      permits: 'primary',
      licensing: 'secondary',
      registration: 'info',
      facilitation: 'success',
      customs: 'warning',
      financial: 'error',
    };
    return colors[category] || 'default';
  };

  const handleServiceRequest = (serviceType: string) => {
    // TODO: Navigate to service request form when implemented
    alert(`Service request form for "${serviceType}" is coming soon!\n\nThis feature will allow you to:\n- Submit service applications online\n- Upload required documents\n- Track application status\n- Receive notifications\n\nFor now, please contact the IPDC office directly.`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {i18n.language === 'am'
                      ? 'አንድ ማቆሚያ አገልግሎቶች'
                      : 'One-Stop-Shop Services'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {i18n.language === 'am'
                      ? 'የኢትዮጵያ IPDC አንድ ማቆሚያ የንግድ አገልግሎቶች'
                      : 'Ethiopian IPDC One-Stop Business Services'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                size="large"
              >
                {i18n.language === 'am' ? 'ወደ ዳሽቦርድ ተመለስ' : 'Back to Dashboard'}
              </Button>
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {i18n.language === 'am'
                ? 'የቀረቡ አገልግሎቶች፡ ኢንቨስትመንት ፈቃዶች፣ የንግድ ፈቃዶች፣ ምዝገባዎች፣ ስምምነቶች እና ሌሎችም'
                : 'Available services include: Investment permits, business licenses, registrations, agreements, and more'}
            </Typography>

            <Tabs
              value={selectedCategory}
              onChange={(e, value) => setSelectedCategory(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {categories.map((category) => (
                <Tab
                  key={category.value}
                  value={category.value}
                  label={i18n.language === 'am' ? category.labelAm : category.label}
                />
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {filteredServices.map((service) => (
            <Grid item xs={12} md={6} lg={4} key={service.type}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {categoryIcons[service.category]}
                      <Typography variant="h6" fontWeight="bold">
                        {i18n.language === 'am' ? service.nameAm : service.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={service.category}
                      color={getCategoryColor(service.category)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {i18n.language === 'am' ? service.descriptionAm : service.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${service.processingTime} ${i18n.language === 'am' ? 'ቀናት' : 'days'}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${service.fee.toLocaleString()} ${i18n.language === 'am' ? 'ብር' : 'ETB'}`}
                      size="small"
                      variant="outlined"
                      color={service.fee === 0 ? 'success' : 'default'}
                    />
                  </Box>

                  <Typography variant="caption" display="block" color="text.secondary">
                    <strong>
                      {i18n.language === 'am' ? 'የሚያስፈልጉ ሰነዶች፡' : 'Required Documents:'}
                    </strong>
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {service.requiredDocuments.slice(0, 3).join(', ')}
                    {service.requiredDocuments.length > 3 &&
                      ` +${service.requiredDocuments.length - 3} more`}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleServiceRequest(service.type)}
                  >
                    {i18n.language === 'am' ? 'አመልክት' : 'Apply Now'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredServices.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {i18n.language === 'am'
                  ? 'በዚህ ምድብ ውስጥ ምንም አገልግሎቶች የሉም'
                  : 'No services in this category'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {i18n.language === 'am'
                  ? 'እባክዎን ሌላ ምድብ ይምረጡ'
                  : 'Please select another category'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default OSSServices;

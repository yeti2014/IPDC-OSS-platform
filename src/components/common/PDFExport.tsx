// src/components/common/PDFExport.tsx

import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as RequestIcon,
  Assessment as ReportIcon,
  Receipt as InvoiceIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { pdfService } from '../../services/pdfService';
import { ServiceRequest } from '../../types';

interface PDFExportProps {
  /**
   * Type of PDF export button
   * - 'menu': Dropdown menu with multiple options
   * - 'request': Single request PDF export
   * - 'analytics': Analytics report PDF export
   */
  type: 'menu' | 'request' | 'analytics';

  /**
   * Service request data (required for 'request' type)
   */
  request?: ServiceRequest;

  /**
   * Analytics data (required for 'analytics' type)
   */
  analyticsData?: {
    requests: ServiceRequest[];
    timeRange: string;
  };

  /**
   * Button variant
   */
  variant?: 'text' | 'outlined' | 'contained';

  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
}

export const PDFExport: React.FC<PDFExportProps> = ({
  type,
  request,
  analyticsData,
  variant = 'outlined',
  size = 'medium'
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (type === 'menu') {
      setAnchorEl(event.currentTarget);
    } else if (type === 'request' && request) {
      handleExportRequest();
    } else if (type === 'analytics' && analyticsData) {
      handleExportAnalytics();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportRequest = async () => {
    if (!request) return;

    try {
      setLoading(true);
      setError('');

      // Convert Firestore Timestamp to Date if needed
      const requestData = {
        ...request,
        createdAt: request.createdAt?.toDate ? request.createdAt.toDate() : new Date(request.createdAt),
        updatedAt: request.updatedAt?.toDate ? request.updatedAt.toDate() : new Date(request.updatedAt)
      };

      pdfService.generateRequestPDF(requestData);

      setSuccess(true);
      handleClose();
    } catch (err: any) {
      console.error('PDF export error:', err);
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalytics = async () => {
    if (!analyticsData) return;

    try {
      setLoading(true);
      setError('');

      const { requests, timeRange } = analyticsData;

      // Calculate analytics
      const totalRequests = requests.length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      const inProgressRequests = requests.filter(r => r.status === 'in-progress').length;
      const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

      // Calculate average completion time
      const completedWithTime = requests.filter(r => r.status === 'completed' && r.createdAt && r.updatedAt);
      let avgCompletionTime = 'N/A';
      if (completedWithTime.length > 0) {
        const totalTime = completedWithTime.reduce((sum, r) => {
          const created = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
          const updated = r.updatedAt?.toDate ? r.updatedAt.toDate() : new Date(r.updatedAt);
          return sum + (updated.getTime() - created.getTime());
        }, 0);
        const avgMs = totalTime / completedWithTime.length;
        const avgHours = Math.round(avgMs / (1000 * 60 * 60));
        avgCompletionTime = `${avgHours} hours`;
      }

      // Tokens spent
      const tokensSpent = requests.reduce((sum, r) => sum + (r.tokenCost || 0), 0);

      // Requests by type
      const requestsByType: Record<string, number> = {};
      requests.forEach(r => {
        requestsByType[r.serviceType] = (requestsByType[r.serviceType] || 0) + 1;
      });

      // Requests by priority
      const requestsByPriority: Record<string, number> = {};
      requests.forEach(r => {
        requestsByPriority[r.priority] = (requestsByPriority[r.priority] || 0) + 1;
      });

      pdfService.generateAnalyticsReportPDF({
        totalRequests,
        completedRequests,
        pendingRequests,
        inProgressRequests,
        completionRate,
        avgCompletionTime,
        tokensSpent,
        requestsByType,
        requestsByPriority,
        timeRange
      });

      setSuccess(true);
      handleClose();
    } catch (err: any) {
      console.error('PDF export error:', err);
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoice = async () => {
    // Placeholder for invoice generation
    // This would be implemented when billing system is ready
    setError('Invoice generation coming soon with billing system');
    handleClose();
  };

  const renderButton = () => {
    if (type === 'menu') {
      return (
        <Button
          variant={variant}
          size={size}
          startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
          endIcon={<ArrowDownIcon />}
          onClick={handleClick}
          disabled={loading}
        >
          Export PDF
        </Button>
      );
    } else if (type === 'request') {
      return (
        <Button
          variant={variant}
          size={size}
          startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
          onClick={handleClick}
          disabled={loading}
        >
          Export as PDF
        </Button>
      );
    } else if (type === 'analytics') {
      return (
        <Button
          variant={variant}
          size={size}
          startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
          onClick={handleClick}
          disabled={loading}
        >
          Export Report
        </Button>
      );
    }
  };

  return (
    <>
      {renderButton()}

      {type === 'menu' && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'pdf-export-button',
          }}
        >
          <MenuItem onClick={handleExportRequest} disabled={!request}>
            <ListItemIcon>
              <RequestIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Current Request</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleExportAnalytics} disabled={!analyticsData}>
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Analytics Report</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleExportInvoice}>
            <ListItemIcon>
              <InvoiceIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Invoice</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {/* Success notification */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          PDF exported successfully!
        </Alert>
      </Snackbar>

      {/* Error notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PDFExport;

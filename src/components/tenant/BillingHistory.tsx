// src/components/tenant/BillingHistory.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { billingService } from '../../services/billingService';
import { pdfService } from '../../services/pdfService';
import { PaymentTransaction, Invoice, PaymentStatus } from '../../types/billing';
import { useAuth } from '../../contexts/AuthContext';

export const BillingHistory = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [txns, invs] = await Promise.all([
        billingService.getUserTransactions(user.uid),
        billingService.getUserInvoices(user.uid)
      ]);

      setTransactions(txns);
      setInvoices(invs);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PaymentStatus): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    const colors: Record<PaymentStatus, any> = {
      'completed': 'success',
      'pending': 'warning',
      'processing': 'info',
      'failed': 'error',
      'refunded': 'default',
      'cancelled': 'default'
    };
    return colors[status] || 'default';
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      await pdfService.generateInvoice(invoice);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Billing History
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`Transactions (${transactions.length})`} />
        <Tab label={`Invoices (${invoices.length})`} />
      </Tabs>

      {tabValue === 0 ? (
        // Transactions Tab
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Payment Method</strong></TableCell>
                <TableCell><strong>Tokens</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Reference</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No transactions yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {format(txn.createdAt, 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(txn.createdAt, 'HH:mm:ss')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {txn.description}
                      </Typography>
                      {txn.packageName && (
                        <Typography variant="caption" color="text.secondary">
                          {txn.packageName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {txn.paymentMethod.replace('-', ' ').toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`+${txn.tokens}`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        ${txn.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={txn.paymentStatus.toUpperCase()}
                        color={getStatusColor(txn.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {txn.transactionReference ? (
                        <Tooltip title={txn.transactionReference}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {txn.transactionReference.substring(0, 12)}...
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Invoices Tab
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Invoice #</strong></TableCell>
                <TableCell><strong>Issue Date</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Tokens</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No invoices yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(invoice.issueDate, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.items.map(item => item.description).join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.items.reduce((sum, item) => sum + (item.tokens || 0), 0)}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          ${invoice.total.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (incl. {invoice.taxRate}% tax)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status.toUpperCase()}
                        color={invoice.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BillingHistory;

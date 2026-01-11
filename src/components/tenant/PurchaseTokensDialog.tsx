// src/components/tenant/PurchaseTokensDialog.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { billingService } from '../../services/billingService';
import { TokenPackage, PaymentMethod } from '../../types/billing';
import { useAuth } from '../../contexts/AuthContext';

interface PurchaseTokensDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PurchaseTokensDialog = ({ open, onClose, onSuccess }: PurchaseTokensDialogProps) => {
  const { currentUser: user, userData } = useAuth();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success'>('select');

  useEffect(() => {
    if (open) {
      loadPackages();
      setStep('select');
      setSelectedPackage(null);
      setError('');
    }
  }, [open]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      console.log('📦 Loading token packages...');
      const pkgs = await billingService.getTokenPackages();
      console.log('📦 Loaded packages:', pkgs);
      setPackages(pkgs);

      if (!pkgs || pkgs.length === 0) {
        console.error('⚠️ No packages returned from billingService');
        setError('No token packages available. Please try again later.');
      }
    } catch (err) {
      console.error('❌ Error loading packages:', err);
      setError('Failed to load token packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setStep('payment');
  };

  const handlePurchase = async () => {
    console.log('🛒 handlePurchase called');
    console.log('📦 Selected package:', selectedPackage);
    console.log('👤 User:', user);
    console.log('📋 User data:', userData);

    if (!selectedPackage || !user || !userData) {
      console.error('❌ Missing required data:', { selectedPackage, user, userData });
      return;
    }

    console.log('✅ Starting purchase process...');
    setProcessing(true);
    setError('');

    try {
      console.log('📝 Creating transaction...');
      // Create transaction
      const result = await billingService.createTransaction(
        user.uid,
        userData.displayName || user.email || 'Unknown',
        user.email || '',
        selectedPackage,
        paymentMethod
      );

      console.log('📝 Transaction result:', result);

      if (!result.success || !result.transactionId) {
        console.error('❌ Transaction creation failed:', result.message);
        setError(result.message);
        setProcessing(false);
        return;
      }

      console.log('✅ Transaction created, ID:', result.transactionId);
      setStep('processing');

      console.log('💳 Processing payment...');
      // Process payment (simulated)
      const paymentResult = await billingService.processPayment(
        result.transactionId,
        user.uid
      );

      console.log('💳 Payment result:', paymentResult);

      if (paymentResult.success) {
        console.log('✅ Payment successful! Showing success screen...');
        setStep('success');
        setTimeout(() => {
          console.log('🎉 Closing dialog and calling onSuccess...');
          onSuccess();
          onClose();
        }, 2000);
      } else {
        console.error('❌ Payment failed:', paymentResult.message);
        setError(paymentResult.message);
        setStep('payment');
      }
    } catch (err: any) {
      console.error('❌ Purchase error:', err);
      setError(err.message || 'An error occurred during purchase');
      setStep('payment');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'credit-card':
      case 'debit-card':
        return <CardIcon />;
      case 'bank-transfer':
        return <BankIcon />;
      case 'mobile-money':
        return <MobileIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {step === 'select' && 'Purchase Service Tokens'}
        {step === 'payment' && 'Payment Method'}
        {step === 'processing' && 'Processing Payment'}
        {step === 'success' && 'Purchase Successful!'}
      </DialogTitle>

      <DialogContent>
        {/* Step 1: Select Package */}
        {step === 'select' && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a token package that best suits your needs
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : packages.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No token packages available at this time. Please try again later or contact support.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {packages.map((pkg) => (
                  <Grid item xs={12} sm={6} key={pkg.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: pkg.popular ? '2px solid' : '1px solid',
                        borderColor: pkg.popular ? 'primary.main' : 'divider',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s'
                        }
                      }}
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      {pkg.popular && (
                        <Chip
                          label="POPULAR"
                          color="primary"
                          size="small"
                          icon={<StarIcon />}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8
                          }}
                        />
                      )}

                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {pkg.name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {pkg.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5 }}>
                            <Typography variant="h4" fontWeight="bold" color="primary">
                              {pkg.price.toLocaleString()} ETB
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            = {pkg.tokens.toLocaleString()} tokens (1 ETB = {(pkg.tokens / pkg.price).toFixed(1)} tokens)
                          </Typography>
                        </Box>

                        {pkg.discount > 0 && (
                          <Chip
                            label={`Save ${pkg.discount}%`}
                            color="success"
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        )}

                        <List dense>
                          {pkg.features.map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>

                        <Button
                          variant={pkg.popular ? 'contained' : 'outlined'}
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPackage(pkg);
                          }}
                        >
                          Select Package
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Step 2: Payment Method */}
        {step === 'payment' && selectedPackage && (
          <>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Selected Package
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {selectedPackage.name} - {selectedPackage.price.toLocaleString()} ETB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPackage.tokens.toLocaleString()} tokens (1 ETB = {(selectedPackage.tokens / selectedPackage.price).toFixed(1)} tokens)
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Choose Payment Method
            </Typography>

            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              <Card sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <FormControlLabel
                    value="credit-card"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CardIcon />
                        <Typography>Credit Card</Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              <Card sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <FormControlLabel
                    value="bank-transfer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BankIcon />
                        <Typography>Bank Transfer</Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              <Card sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <FormControlLabel
                    value="mobile-money"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MobileIcon />
                        <div>
                          <Typography>Mobile Money</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Telebirr, M-Birr, HelloCash
                          </Typography>
                        </div>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </RadioGroup>

            <Divider sx={{ my: 3 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Demo Mode:</strong> This is a demonstration/proof-of-concept. Click "Complete Purchase" to receive tokens instantly for testing the platform's service request features. In production, this would integrate with Ethiopian payment gateways (Telebirr, M-Birr, HelloCash) and banking systems for real transactions.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography fontWeight="bold">{selectedPackage.price.toLocaleString()} ETB</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (15% VAT):</Typography>
              <Typography>{(selectedPackage.price * 0.15).toLocaleString()} ETB</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Total (ETB):</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {(selectedPackage.price * 1.15).toLocaleString()} ETB
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You will receive:
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {selectedPackage.tokens.toLocaleString()} Service Tokens
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Exchange rate: 1 ETB = {(selectedPackage.tokens / selectedPackage.price).toFixed(1)} tokens
              </Typography>
            </Box>
          </>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your payment
            </Typography>
          </Box>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom color="success.main">
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your tokens have been added to your account
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === 'select' && (
          <Button onClick={onClose}>Cancel</Button>
        )}

        {step === 'payment' && (
          <>
            <Button onClick={() => setStep('select')}>Back</Button>
            <Button
              onClick={handlePurchase}
              variant="contained"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Purchase'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseTokensDialog;

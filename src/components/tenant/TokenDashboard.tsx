// src/components/tenant/TokenDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccountBalance as TokenIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { tokenService, SERVICE_COSTS, TIER_BENEFITS } from '../../services/tokenService';
import { TokenAccount, TokenTransaction, TokenTier } from '../../types/token';
import PurchaseTokensDialog from './PurchaseTokensDialog';
import BillingHistory from './BillingHistory';

export const TokenDashboard = () => {
  const { userData } = useAuth();
  const [account, setAccount] = useState<TokenAccount | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TokenTier>('basic');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    loadTokenData();
  }, [userData]);

  const loadTokenData = async () => {
    if (!userData?.uid) return;

    try {
      setLoading(true);
      let tokenAccount = await tokenService.getTokenAccount(userData.uid);

      // Create account if it doesn't exist
      if (!tokenAccount) {
        tokenAccount = await tokenService.createTokenAccount(
          userData.uid,
          userData.displayName || userData.email || 'Unknown Tenant',
          1000 // Initial balance
        );
      }

      setAccount(tokenAccount);

      // Load transactions
      const txHistory = await tokenService.getTransactionHistory(userData.uid, 20);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error loading token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: TokenTier): 'default' | 'info' | 'warning' | 'success' => {
    switch (tier) {
      case 'platinum': return 'success';
      case 'gold': return 'warning';
      case 'silver': return 'info';
      default: return 'default';
    }
  };

  const getTierProgress = (balance: number): number => {
    if (balance >= TIER_BENEFITS.platinum.minBalance) return 100;
    if (balance >= TIER_BENEFITS.gold.minBalance) {
      return ((balance - TIER_BENEFITS.gold.minBalance) /
        (TIER_BENEFITS.platinum.minBalance - TIER_BENEFITS.gold.minBalance)) * 100;
    }
    if (balance >= TIER_BENEFITS.silver.minBalance) {
      return ((balance - TIER_BENEFITS.silver.minBalance) /
        (TIER_BENEFITS.gold.minBalance - TIER_BENEFITS.silver.minBalance)) * 100;
    }
    return (balance / TIER_BENEFITS.silver.minBalance) * 100;
  };

  const getNextTier = (currentTier: TokenTier): { tier: string; required: number } | null => {
    const balance = account?.balance || 0;
    if (currentTier === 'platinum') return null;
    if (currentTier === 'gold') {
      return { tier: 'Platinum', required: TIER_BENEFITS.platinum.minBalance - balance };
    }
    if (currentTier === 'silver') {
      return { tier: 'Gold', required: TIER_BENEFITS.gold.minBalance - balance };
    }
    return { tier: 'Silver', required: TIER_BENEFITS.silver.minBalance - balance };
  };

  const getTransactionTypeColor = (type: string) => {
    if (type.includes('request') || type === 'penalty') return 'error';
    if (type.includes('completion') || type === 'refund' || type === 'bonus') return 'success';
    return 'info';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography textAlign="center" py={4}>Loading token information...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">No token account found. Please contact support.</Alert>
        </CardContent>
      </Card>
    );
  }

  const tierBenefits = TIER_BENEFITS[account.tier];
  const nextTier = getNextTier(account.tier);

  return (
    <>
      <Grid container spacing={3}>
        {/* Token Balance Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Token Balance
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {account.balance.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    tokens available
                  </Typography>
                </Box>
                <TokenIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Current Tier</Typography>
                  <Chip
                    label={account.tier.toUpperCase()}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                </Box>
                {nextTier && (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={getTierProgress(account.balance)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                      }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                      {nextTier.required} more tokens to reach {nextTier.tier}
                    </Typography>
                  </>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                onClick={() => setPurchaseDialogOpen(true)}
                sx={{
                  mt: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Purchase Tokens
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Token Statistics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Token Statistics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="body2" color="text.secondary">Total Earned</Typography>
                    </Box>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {account.totalEarned.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingDownIcon color="error" />
                      <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                    </Box>
                    <Typography variant="h5" color="error.main" fontWeight="bold">
                      {account.totalSpent.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Discount</Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      {tierBenefits.discountPercentage}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Expires In</Typography>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {account.expiryDate
                        ? `${Math.ceil((account.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
                        : 'Never'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tier Benefits */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Your {account.tier.toUpperCase()} Tier Benefits</Typography>
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => setInfoDialogOpen(true)}
                >
                  View All Tiers
                </Button>
              </Box>
              <Grid container spacing={2}>
                {tierBenefits.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Transaction History" icon={<HistoryIcon />} iconPosition="start" />
                <Tab label="Service Costs" icon={<InfoIcon />} iconPosition="start" />
                <Tab label="Billing & Invoices" icon={<ReceiptIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary" py={2}>
                              No transactions yet
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((tx) => (
                          <TableRow key={tx.id} hover>
                            <TableCell>
                              <Typography variant="caption">
                                {formatDistanceToNow(tx.createdAt, { addSuffix: true })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={tx.type.replace(/_/g, ' ').toUpperCase()}
                                size="small"
                                color={getTransactionTypeColor(tx.type)}
                              />
                            </TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={tx.amount > 0 ? 'success.main' : 'error.main'}
                              >
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{tx.balanceAfter.toLocaleString()}</Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tabValue === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Service Type</TableCell>
                        <TableCell>Low</TableCell>
                        <TableCell>Medium</TableCell>
                        <TableCell>High</TableCell>
                        <TableCell>Urgent</TableCell>
                        <TableCell>Your Cost (with {tierBenefits.discountPercentage}% discount)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.values(SERVICE_COSTS).map((service) => (
                        <TableRow key={service.serviceType} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {service.description}
                            </Typography>
                          </TableCell>
                          <TableCell>{service.priority.low}</TableCell>
                          <TableCell>{service.priority.medium}</TableCell>
                          <TableCell>{service.priority.high}</TableCell>
                          <TableCell>{service.priority.urgent}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${tokenService.calculateServiceCost(service.serviceType, 'medium', account.tier)} tokens`}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tabValue === 2 && (
                <BillingHistory />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Purchase Tokens Dialog */}
      <PurchaseTokensDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        onSuccess={() => {
          loadTokenData();
          setPurchaseDialogOpen(false);
        }}
      />

      {/* All Tiers Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Token Tier System</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.values(TIER_BENEFITS).map((tier) => (
              <Grid item xs={12} sm={6} key={tier.tier}>
                <Card variant="outlined" sx={{
                  borderColor: account.tier === tier.tier ? 'primary.main' : 'divider',
                  borderWidth: account.tier === tier.tier ? 2 : 1
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {tier.tier.toUpperCase()}
                      </Typography>
                      <Chip
                        label={tier.discountPercentage + '% OFF'}
                        color={getTierColor(tier.tier)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Minimum Balance: {tier.minBalance} tokens
                    </Typography>
                    <List dense>
                      {tier.features.map((feature, idx) => (
                        <ListItem key={idx} disablePadding>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{feature}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TokenDashboard;

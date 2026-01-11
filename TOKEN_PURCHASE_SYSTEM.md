# Token Purchase System - Implementation Guide

## Overview

The IPDC Digital Platform uses a **token-based economy** where tenants purchase service tokens using **Ethiopian Birr (ETB)** to access various one-stop-shop services.

## Current Implementation (Demo/Testing Mode)

### Features Implemented

1. **Token Package Display**
   - 4 token packages with Ethiopian Birr pricing
   - Exchange rate: 1 ETB = ~2 tokens (varies by package)
   - Discount tiers: Basic (0%), Silver (12%), Gold (20%), Platinum (30%)

2. **Payment Methods**
   - Credit Card
   - Bank Transfer
   - Mobile Money (Telebirr, M-Birr, HelloCash)

3. **Transaction Processing**
   - Transaction creation and tracking
   - Invoice generation with 15% VAT (Ethiopian standard)
   - Token allocation to user accounts
   - Transaction history

4. **Demo Mode**
   - All payments automatically succeed (for testing/demonstration)
   - 2-second simulated processing delay
   - Full transaction flow without real payment gateway

### Token Packages

| Package | Price (ETB) | Tokens | Discount | Exchange Rate |
|---------|-------------|--------|----------|---------------|
| Basic | 50 | 100 | 0% | 1 ETB = 2.0 tokens |
| Silver | 110 | 250 | 12% | 1 ETB = 2.3 tokens |
| Gold | 200 | 500 | 20% | 1 ETB = 2.5 tokens |
| Platinum | 350 | 1000 | 30% | 1 ETB = 2.9 tokens |

## Production Implementation Requirements

### 1. Ethiopian Payment Gateway Integration

#### Telebirr Integration
- **Provider**: Ethio Telecom
- **API Documentation**: Contact Ethio Telecom Business Solutions
- **Implementation Steps**:
  1. Register as Telebirr merchant
  2. Obtain API credentials (Merchant ID, API Key)
  3. Implement Telebirr SDK/API
  4. Set up webhook for payment notifications
  5. Implement reconciliation system

#### M-Birr Integration
- **Provider**: Lion International Bank
- **API Documentation**: Contact Lion Bank
- **Implementation Steps**:
  1. Open merchant account with Lion Bank
  2. Obtain M-Birr API access
  3. Integrate payment request API
  4. Set up payment confirmation callbacks
  5. Implement error handling and retry logic

#### HelloCash Integration
- **Provider**: Kifiya Financial Technology
- **API Documentation**: https://hellocash.et (merchant portal)
- **Implementation Steps**:
  1. Register as HelloCash merchant
  2. Obtain API credentials
  3. Implement payment initiation flow
  4. Set up IPN (Instant Payment Notification)
  5. Test in sandbox environment

### 2. Banking Integration

#### Commercial Bank of Ethiopia (CBE) Integration
- Direct bank transfer integration
- Corporate account setup
- Virtual account number generation per tenant
- Automated reconciliation

#### Other Ethiopian Banks
- Awash Bank
- Dashen Bank
- Bank of Abyssinia
- Cooperative Bank of Oromia

### 3. International Payment Processors (Optional)

#### Stripe
```typescript
// Example implementation
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function processStripePayment(amount: number, currency: string = 'ETB') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: currency.toLowerCase(),
    payment_method_types: ['card'],
  });

  return paymentIntent;
}
```

#### PayPal
- PayPal Business account
- REST API integration
- Currency conversion (if needed)

### 4. Code Changes Required for Production

#### File: `src/services/billingService.ts`

**Current (Demo Mode):**
```typescript
private async simulatePaymentGateway(transaction: PaymentTransaction): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return true; // Always succeed
}
```

**Production Implementation:**
```typescript
private async processRealPayment(transaction: PaymentTransaction): Promise<{
  success: boolean;
  transactionRef?: string;
  errorMessage?: string;
}> {
  const { paymentMethod, amount, userId } = transaction;

  try {
    switch (paymentMethod) {
      case 'mobile-money':
        return await this.processMobileMoneyPayment(transaction);

      case 'bank-transfer':
        return await this.processBankTransfer(transaction);

      case 'credit-card':
      case 'debit-card':
        return await this.processCardPayment(transaction);

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      errorMessage: error.message || 'Payment processing failed'
    };
  }
}

// Mobile Money (Telebirr, M-Birr, HelloCash)
private async processMobileMoneyPayment(transaction: PaymentTransaction) {
  // TODO: Integrate with Ethiopian mobile money providers
  // Example: Telebirr API call
  const response = await fetch('https://api.telebirr.et/payment/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TELEBIRR_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchantId: process.env.TELEBIRR_MERCHANT_ID,
      amount: transaction.amount,
      currency: 'ETB',
      referenceId: transaction.id,
      callbackUrl: `${process.env.APP_URL}/api/payment/callback`,
    }),
  });

  const data = await response.json();
  return {
    success: data.status === 'success',
    transactionRef: data.transactionId,
  };
}

// Bank Transfer
private async processBankTransfer(transaction: PaymentTransaction) {
  // TODO: Generate virtual account or reference number
  // Wait for bank confirmation via webhook
  return {
    success: false,
    errorMessage: 'Bank transfer pending confirmation',
  };
}

// Card Payment
private async processCardPayment(transaction: PaymentTransaction) {
  // TODO: Integrate with card processor (Stripe, local processor)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(transaction.amount * 100), // Convert to cents
    currency: 'etb',
    metadata: {
      transactionId: transaction.id,
      userId: transaction.userId,
    },
  });

  return {
    success: paymentIntent.status === 'succeeded',
    transactionRef: paymentIntent.id,
  };
}
```

### 5. Environment Variables Needed

Create `.env.production` file:

```env
# Telebirr
TELEBIRR_MERCHANT_ID=your_merchant_id
TELEBIRR_API_KEY=your_api_key
TELEBIRR_SECRET_KEY=your_secret_key
TELEBIRR_SANDBOX=false

# M-Birr
MBIRR_MERCHANT_CODE=your_merchant_code
MBIRR_API_KEY=your_api_key
MBIRR_API_SECRET=your_api_secret

# HelloCash
HELLOCASH_MERCHANT_ID=your_merchant_id
HELLOCASH_API_KEY=your_api_key
HELLOCASH_IPN_SECRET=your_ipn_secret

# Stripe (Optional)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Banking
CBE_ACCOUNT_NUMBER=your_account
CBE_API_KEY=your_api_key

# Application
APP_URL=https://ipdc-platform.et
PAYMENT_CALLBACK_URL=https://ipdc-platform.et/api/payment/callback
```

### 6. Webhook/Callback Implementation

Create a payment callback endpoint to receive payment confirmations:

```typescript
// src/api/payment/callback.ts
import { Request, Response } from 'express';

export async function handlePaymentCallback(req: Request, res: Response) {
  const { transactionId, status, referenceId, amount, paymentMethod } = req.body;

  // Verify webhook signature
  const isValid = verifyWebhookSignature(req);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Update transaction in Firestore
  await updateDoc(doc(db, 'paymentTransactions', transactionId), {
    paymentStatus: status === 'success' ? 'completed' : 'failed',
    transactionReference: referenceId,
    processedAt: serverTimestamp(),
  });

  // If successful, allocate tokens
  if (status === 'success') {
    const transaction = await getDoc(doc(db, 'paymentTransactions', transactionId));
    const data = transaction.data();

    await tokenService.allocateTokens(
      data.userId,
      data.tokens,
      `Token purchase - ${data.packageName}`,
      transactionId
    );

    // Send confirmation email/SMS
    await sendPaymentConfirmation(data.userEmail, data);
  }

  res.status(200).json({ success: true });
}
```

### 7. Security Considerations

1. **PCI DSS Compliance** (if handling cards directly)
   - Never store card details
   - Use tokenization
   - Implement 3D Secure

2. **Webhook Security**
   - Verify signatures
   - Use HTTPS only
   - Implement replay protection

3. **Transaction Idempotency**
   - Prevent duplicate charges
   - Use unique transaction IDs
   - Implement retry logic safely

4. **Data Encryption**
   - Encrypt sensitive data at rest
   - Use TLS for all API calls
   - Secure API keys in environment variables

### 8. Testing Strategy

1. **Sandbox Testing**
   - Use provider sandbox environments
   - Test all payment methods
   - Verify error handling

2. **End-to-End Testing**
   - Test complete purchase flow
   - Verify token allocation
   - Check invoice generation

3. **Load Testing**
   - Simulate concurrent purchases
   - Test payment gateway limits
   - Monitor performance

### 9. Monitoring and Logging

```typescript
// Add comprehensive logging
console.log('💳 Payment initiated:', {
  userId: transaction.userId,
  amount: transaction.amount,
  method: transaction.paymentMethod,
  timestamp: new Date().toISOString(),
});

// Track metrics
analytics.track('payment_initiated', {
  amount: transaction.amount,
  currency: 'ETB',
  method: transaction.paymentMethod,
});

// Error tracking
try {
  await processPayment();
} catch (error) {
  console.error('❌ Payment error:', error);
  errorTracking.captureException(error, {
    context: { transactionId: transaction.id },
  });
}
```

### 10. Regulatory Compliance

- **National Bank of Ethiopia (NBE)** regulations
- **Payment Services Directive** compliance
- **Anti-Money Laundering (AML)** requirements
- **Know Your Customer (KYC)** procedures
- **Tax compliance** (15% VAT reporting)

## Current Demo Mode Usage

For testing and demonstration:

1. Click "Purchase Tokens" button
2. Select any token package
3. Choose any payment method
4. Click "Complete Purchase"
5. Payment will automatically succeed after 2 seconds
6. Tokens are immediately added to account
7. Invoice is generated automatically

## Next Steps for Production

1. ✅ Choose payment gateway providers
2. ✅ Register merchant accounts
3. ✅ Obtain API credentials
4. ✅ Implement payment gateway integration
5. ✅ Set up webhooks/callbacks
6. ✅ Test in sandbox environments
7. ✅ Implement security measures
8. ✅ Conduct end-to-end testing
9. ✅ Deploy to production
10. ✅ Monitor and optimize

## Support Contacts

### Ethiopian Payment Providers
- **Telebirr**: business@ethiotelecom.et
- **M-Birr**: support@mbirr.et
- **HelloCash**: merchant@hellocash.et

### Banking
- **CBE**: corporate@cbe.com.et
- **Awash Bank**: corporate@awashbank.com
- **Dashen Bank**: corporate@dashenbanksc.com

## Additional Resources

- [National Bank of Ethiopia](https://nbe.gov.et)
- [Ethiopian Payments Association](https://ethiopianpayments.org)
- [Telebirr Developer Portal](https://developer.telebirr.et)
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com)

---

**Note**: This is a demonstration/proof-of-concept implementation. Real payment integration requires merchant accounts, API access, and compliance with Ethiopian banking regulations.

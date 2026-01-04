// src/services/billingService.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  TokenPackage,
  PaymentTransaction,
  Invoice,
  InvoiceLineItem,
  BillingStatistics,
  PaymentStatus,
  InvoiceStatus,
  PaymentMethod
} from '../types/billing';
import { tokenService } from './tokenService';

/**
 * Billing & Invoicing Service
 * Handles token purchases, payment processing, and invoice generation
 */

class BillingService {
  private readonly transactionsCollection = 'paymentTransactions';
  private readonly invoicesCollection = 'invoices';
  private readonly packagesCollection = 'tokenPackages';

  /**
   * Get available token packages
   */
  async getTokenPackages(): Promise<TokenPackage[]> {
    try {
      const snapshot = await getDocs(collection(db, this.packagesCollection));

      // If we have packages in Firestore, return them
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TokenPackage));
      }

      // Otherwise return default packages
      console.log('📦 No packages in Firestore, using default packages');
      return this.getDefaultPackages();
    } catch (error) {
      console.error('❌ Error getting token packages:', error);
      console.log('📦 Falling back to default packages');
      return this.getDefaultPackages();
    }
  }

  /**
   * Default token packages (fallback)
   * Prices in Ethiopian Birr (ETB)
   * Exchange rate: 1 ETB = 2 tokens
   */
  private getDefaultPackages(): TokenPackage[] {
    return [
      {
        id: 'basic-100',
        name: 'Basic Package',
        description: 'Perfect for getting started',
        tokens: 100,
        price: 50,
        discount: 0,
        features: [
          '100 service tokens',
          'Valid for 6 months',
          'Email support'
        ]
      },
      {
        id: 'silver-250',
        name: 'Silver Package',
        description: 'Most popular choice',
        tokens: 250,
        price: 110,
        discount: 12,
        popular: true,
        features: [
          '250 service tokens',
          '12% discount (save 15 ETB)',
          'Valid for 12 months',
          'Priority email support',
          'Silver tier benefits'
        ]
      },
      {
        id: 'gold-500',
        name: 'Gold Package',
        description: 'Best value for frequent users',
        tokens: 500,
        price: 200,
        discount: 20,
        features: [
          '500 service tokens',
          '20% discount (save 50 ETB)',
          'Valid for 18 months',
          'Priority support',
          'Gold tier benefits',
          'Free tier upgrade'
        ]
      },
      {
        id: 'platinum-1000',
        name: 'Platinum Package',
        description: 'Ultimate package for enterprise',
        tokens: 1000,
        price: 350,
        discount: 30,
        features: [
          '1000 service tokens',
          '30% discount (save 150 ETB)',
          'Valid for 24 months',
          '24/7 dedicated support',
          'Platinum tier benefits',
          'Free tier upgrade',
          'Custom integrations'
        ]
      }
    ];
  }

  /**
   * Create payment transaction
   */
  async createTransaction(
    userId: string,
    userName: string,
    userEmail: string,
    packageData: TokenPackage,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    try {
      const transaction: Omit<PaymentTransaction, 'id'> = {
        userId,
        userName,
        userEmail,
        type: 'token-purchase',
        amount: packageData.price,
        tokens: packageData.tokens,
        packageId: packageData.id,
        packageName: packageData.name,
        paymentMethod,
        paymentStatus: 'pending',
        description: `Purchase of ${packageData.tokens} tokens - ${packageData.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.transactionsCollection), {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Transaction created:', docRef.id);

      return {
        success: true,
        message: 'Transaction created successfully',
        transactionId: docRef.id
      };
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      return {
        success: false,
        message: error.message || 'Failed to create transaction'
      };
    }
  }

  /**
   * Process payment (simplified - would integrate with real payment gateway)
   */
  async processPayment(
    transactionId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const transactionRef = doc(db, this.transactionsCollection, transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        return { success: false, message: 'Transaction not found' };
      }

      const transaction = transactionDoc.data() as PaymentTransaction;

      // Simulate payment processing
      // In production, this would integrate with Stripe, PayPal, etc.
      const paymentSuccessful = await this.simulatePaymentGateway(transaction);

      if (paymentSuccessful) {
        // Update transaction status
        await updateDoc(transactionRef, {
          paymentStatus: 'completed',
          processedAt: serverTimestamp(),
          transactionReference: this.generateTransactionReference(),
          receiptNumber: this.generateReceiptNumber(),
          updatedAt: serverTimestamp()
        });

        // Allocate tokens to user
        await tokenService.creditTokens(
          userId,
          transaction.tokens,
          'purchase',
          `Token purchase - ${transaction.packageName}`,
          'system',
          transactionId
        );

        // Generate invoice
        await this.generateInvoice(transactionId, userId);

        console.log('✅ Payment processed successfully');

        return {
          success: true,
          message: 'Payment processed successfully'
        };
      } else {
        await updateDoc(transactionRef, {
          paymentStatus: 'failed',
          updatedAt: serverTimestamp()
        });

        return {
          success: false,
          message: 'Payment processing failed'
        };
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: error.message || 'Failed to process payment'
      };
    }
  }

  /**
   * Generate invoice from transaction
   */
  async generateInvoice(
    transactionId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; invoiceId?: string }> {
    try {
      const transactionDoc = await getDoc(doc(db, this.transactionsCollection, transactionId));

      if (!transactionDoc.exists()) {
        return { success: false, message: 'Transaction not found' };
      }

      const transaction = transactionDoc.data() as PaymentTransaction;

      const lineItem: InvoiceLineItem = {
        id: '1',
        description: `${transaction.packageName} - ${transaction.tokens} tokens`,
        quantity: 1,
        unitPrice: transaction.amount,
        amount: transaction.amount,
        tokens: transaction.tokens
      };

      const subtotal = transaction.amount;
      const taxRate = 15; // 15% VAT (Ethiopia)
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const invoice: Omit<Invoice, 'id'> = {
        invoiceNumber: this.generateInvoiceNumber(),
        userId: transaction.userId,
        userName: transaction.userName,
        userEmail: transaction.userEmail,
        billingAddress: transaction.billingAddress || {
          street: 'N/A',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          postalCode: '1000',
          country: 'Ethiopia'
        },
        status: 'paid',
        issueDate: new Date(),
        dueDate: new Date(),
        paidDate: new Date(),
        items: [lineItem],
        subtotal,
        taxRate,
        taxAmount,
        discount: 0,
        total,
        amountPaid: total,
        amountDue: 0,
        paymentMethod: transaction.paymentMethod,
        paymentTransactionId: transactionId,
        terms: 'Thank you for your purchase. Tokens are valid as per package terms.',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      };

      const docRef = await addDoc(collection(db, this.invoicesCollection), {
        ...invoice,
        issueDate: serverTimestamp(),
        dueDate: serverTimestamp(),
        paidDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update transaction with invoice ID
      await updateDoc(doc(db, this.transactionsCollection, transactionId), {
        invoiceId: docRef.id
      });

      console.log('✅ Invoice generated:', docRef.id);

      return {
        success: true,
        message: 'Invoice generated successfully',
        invoiceId: docRef.id
      };
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      return {
        success: false,
        message: error.message || 'Failed to generate invoice'
      };
    }
  }

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
    try {
      const q = query(
        collection(db, this.transactionsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate(),
        refundedAt: doc.data().refundedAt?.toDate()
      } as PaymentTransaction));
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  /**
   * Get user's invoices
   */
  async getUserInvoices(userId: string): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, this.invoicesCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertToInvoice(doc));
    } catch (error) {
      console.error('Error getting user invoices:', error);
      return [];
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const docSnap = await getDoc(doc(db, this.invoicesCollection, invoiceId));
      if (docSnap.exists()) {
        return this.convertToInvoice(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting invoice:', error);
      return null;
    }
  }

  /**
   * Get billing statistics
   */
  async getBillingStatistics(): Promise<BillingStatistics> {
    try {
      const snapshot = await getDocs(collection(db, this.transactionsCollection));
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as PaymentTransaction));

      const completedTransactions = transactions.filter(t => t.paymentStatus === 'completed');

      const stats: BillingStatistics = {
        totalRevenue: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
        totalTransactions: completedTransactions.length,
        totalTokensSold: completedTransactions.reduce((sum, t) => sum + t.tokens, 0),
        pendingPayments: transactions.filter(t => t.paymentStatus === 'pending').length,
        overdueInvoices: 0,
        monthlyRevenue: 0,
        monthlyTransactions: 0,
        revenueByMethod: {} as any,
        averageTransactionValue: 0,
        averageTokensPerTransaction: 0
      };

      // Calculate monthly stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyTrans = completedTransactions.filter(t => t.createdAt >= monthStart);

      stats.monthlyRevenue = monthlyTrans.reduce((sum, t) => sum + t.amount, 0);
      stats.monthlyTransactions = monthlyTrans.length;

      // Averages
      if (completedTransactions.length > 0) {
        stats.averageTransactionValue = stats.totalRevenue / completedTransactions.length;
        stats.averageTokensPerTransaction = stats.totalTokensSold / completedTransactions.length;
      }

      return stats;
    } catch (error) {
      console.error('Error calculating billing statistics:', error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        totalTokensSold: 0,
        pendingPayments: 0,
        overdueInvoices: 0,
        monthlyRevenue: 0,
        monthlyTransactions: 0,
        revenueByMethod: {} as any,
        averageTransactionValue: 0,
        averageTokensPerTransaction: 0
      };
    }
  }

  /**
   * Simulate payment gateway (for demo purposes)
   * In a production environment, this would integrate with:
   * - Ethiopian payment gateways (Telebirr, HelloCash, M-Birr)
   * - International payment processors (Stripe, PayPal)
   * - Bank transfer systems
   *
   * For demonstration/testing purposes, all payments succeed automatically.
   */
  private async simulatePaymentGateway(transaction: PaymentTransaction): Promise<boolean> {
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Always return true for demo/testing
    // In production, this would verify actual payment with payment gateway
    console.log('💳 Processing simulated payment for:', transaction.paymentMethod);
    console.log('💰 Amount:', transaction.amount, 'ETB');
    console.log('🎟️ Tokens:', transaction.tokens);

    return true; // Always succeed for demo/testing
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${random}`;
  }

  /**
   * Generate transaction reference
   */
  private generateTransactionReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Generate receipt number
   */
  private generateReceiptNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}-${random}`;
  }

  /**
   * Convert Firestore document to Invoice
   */
  private convertToInvoice(doc: any): Invoice {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      issueDate: data.issueDate?.toDate() || new Date(),
      dueDate: data.dueDate?.toDate() || new Date(),
      paidDate: data.paidDate?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Invoice;
  }
}

export const billingService = new BillingService();
export default billingService;

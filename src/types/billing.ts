// src/types/billing.ts

/**
 * Billing & Invoicing Types
 * For managing token purchases, invoices, and payment history
 */

export type PaymentMethod =
  | 'credit-card'
  | 'debit-card'
  | 'bank-transfer'
  | 'mobile-money'
  | 'cash'
  | 'check';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'cancelled';

export interface TokenPackage {
  id: string;
  name: string;
  description: string;
  tokens: number;
  price: number;
  discount: number; // Percentage
  popular?: boolean;
  features: string[];
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;

  // Transaction details
  type: 'token-purchase' | 'refund' | 'adjustment';
  amount: number;
  tokens: number;
  packageId?: string;
  packageName?: string;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string; // External payment gateway reference

  // Billing details
  invoiceId?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Metadata
  description: string;
  notes?: string;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  refundedAt?: Date;

  // Receipt
  receiptUrl?: string;
  receiptNumber?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., "INV-2024-001"

  // Customer
  userId: string;
  userName: string;
  userEmail: string;
  userCompany?: string;

  // Billing details
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Invoice details
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;

  // Line items
  items: InvoiceLineItem[];

  // Totals
  subtotal: number;
  taxRate: number; // Percentage
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;

  // Payment
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: string;

  // Notes
  notes?: string;
  terms?: string;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // PDF
  pdfUrl?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tokens?: number; // For token purchases
}

export interface BillingStatistics {
  totalRevenue: number;
  totalTransactions: number;
  totalTokensSold: number;
  pendingPayments: number;
  overdueInvoices: number;

  // By period
  monthlyRevenue: number;
  monthlyTransactions: number;

  // By payment method
  revenueByMethod: Record<PaymentMethod, number>;

  // Average
  averageTransactionValue: number;
  averageTokensPerTransaction: number;
}

export interface PaymentIntentData {
  amount: number;
  tokens: number;
  packageId?: string;
  userId: string;
  userEmail: string;
  paymentMethod: PaymentMethod;
}

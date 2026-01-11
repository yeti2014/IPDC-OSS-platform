// src/types/token.ts

export type TokenTransactionType =
  | 'initial_allocation'
  | 'service_request'
  | 'service_completion'
  | 'refund'
  | 'bonus'
  | 'penalty'
  | 'transfer'
  | 'purchase';

export type TokenTier = 'basic' | 'silver' | 'gold' | 'platinum';

export interface TokenAccount {
  id: string;
  userId: string;
  tenantName: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  tier: TokenTier;
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
  isActive: boolean;
}

export interface TokenTransaction {
  id: string;
  accountId: string;
  userId: string;
  type: TokenTransactionType;
  amount: number; // Positive for credit, negative for debit
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedRequestId?: string;
  relatedInvoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number; // In ETB (Ethiopian Birr)
  currency: string;
  description: string;
  bonusTokens?: number;
  validityDays: number;
  isActive: boolean;
  tier: TokenTier;
}

export interface ServiceTokenCost {
  serviceType: string;
  baseCost: number;
  priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  description: string;
}

export interface TokenTierBenefits {
  tier: TokenTier;
  minBalance: number;
  discountPercentage: number;
  prioritySupport: boolean;
  maxRequestsPerMonth: number;
  features: string[];
}

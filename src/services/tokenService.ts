// src/services/tokenService.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  TokenAccount,
  TokenTransaction,
  TokenTransactionType,
  ServiceTokenCost,
  TokenTier,
  TokenTierBenefits
} from '../types/token';

// Service costs configuration
export const SERVICE_COSTS: Record<string, ServiceTokenCost> = {
  'maintenance': {
    serviceType: 'maintenance',
    baseCost: 50,
    priority: { low: 50, medium: 75, high: 100, urgent: 150 },
    description: 'Facility maintenance and repairs'
  },
  'utilities': {
    serviceType: 'utilities',
    baseCost: 30,
    priority: { low: 30, medium: 50, high: 75, urgent: 100 },
    description: 'Electricity, water, and utility services'
  },
  'security': {
    serviceType: 'security',
    baseCost: 40,
    priority: { low: 40, medium: 60, high: 90, urgent: 120 },
    description: 'Security and safety services'
  },
  'cleaning': {
    serviceType: 'cleaning',
    baseCost: 25,
    priority: { low: 25, medium: 40, high: 60, urgent: 80 },
    description: 'Cleaning and sanitation services'
  },
  'it-support': {
    serviceType: 'it-support',
    baseCost: 60,
    priority: { low: 60, medium: 90, high: 120, urgent: 180 },
    description: 'IT and technical support'
  },
  'waste-management': {
    serviceType: 'waste-management',
    baseCost: 35,
    priority: { low: 35, medium: 55, high: 80, urgent: 110 },
    description: 'Waste collection and management'
  },
  'other': {
    serviceType: 'other',
    baseCost: 45,
    priority: { low: 45, medium: 70, high: 95, urgent: 130 },
    description: 'Other services'
  }
};

// Token tier benefits
export const TIER_BENEFITS: Record<TokenTier, TokenTierBenefits> = {
  'basic': {
    tier: 'basic',
    minBalance: 0,
    discountPercentage: 0,
    prioritySupport: false,
    maxRequestsPerMonth: 10,
    features: ['Basic service access', 'Standard response time']
  },
  'silver': {
    tier: 'silver',
    minBalance: 500,
    discountPercentage: 5,
    prioritySupport: false,
    maxRequestsPerMonth: 25,
    features: ['5% discount on services', 'Faster response time', 'Monthly reports']
  },
  'gold': {
    tier: 'gold',
    minBalance: 1500,
    discountPercentage: 10,
    prioritySupport: true,
    maxRequestsPerMonth: 50,
    features: ['10% discount on services', 'Priority support', 'Dedicated account manager', 'Weekly reports']
  },
  'platinum': {
    tier: 'platinum',
    minBalance: 3000,
    discountPercentage: 15,
    prioritySupport: true,
    maxRequestsPerMonth: -1, // Unlimited
    features: ['15% discount on services', 'VIP support', 'Dedicated team', 'Real-time analytics', 'Custom SLA']
  }
};

class TokenService {
  private readonly COLLECTIONS = {
    ACCOUNTS: 'tokenAccounts',
    TRANSACTIONS: 'tokenTransactions',
    PACKAGES: 'tokenPackages'
  };

  // Initialize token account for a new tenant
  async createTokenAccount(
    userId: string,
    tenantName: string,
    initialBalance: number = 1000
  ): Promise<TokenAccount> {
    try {
      const accountRef = doc(db, this.COLLECTIONS.ACCOUNTS, userId);

      const tokenAccount: Omit<TokenAccount, 'id'> = {
        userId,
        tenantName,
        balance: initialBalance,
        totalEarned: initialBalance,
        totalSpent: 0,
        tier: 'basic',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true
      };

      await setDoc(accountRef, {
        ...tokenAccount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiryDate: Timestamp.fromDate(tokenAccount.expiryDate!)
      });

      // Record initial allocation transaction
      await this.recordTransaction({
        accountId: userId,
        userId,
        type: 'initial_allocation',
        amount: initialBalance,
        balanceBefore: 0,
        balanceAfter: initialBalance,
        description: 'Initial token allocation',
        createdBy: 'system'
      });

      return { id: userId, ...tokenAccount };
    } catch (error) {
      console.error('Error creating token account:', error);
      throw error;
    }
  }

  // Get token account
  async getTokenAccount(userId: string): Promise<TokenAccount | null> {
    try {
      const accountRef = doc(db, this.COLLECTIONS.ACCOUNTS, userId);
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) {
        return null;
      }

      const data = accountSnap.data();
      return {
        id: accountSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        expiryDate: data.expiryDate?.toDate()
      } as TokenAccount;
    } catch (error) {
      console.error('Error getting token account:', error);
      throw error;
    }
  }

  // Calculate service cost
  calculateServiceCost(
    serviceType: string,
    priority: string = 'medium',
    tier: TokenTier = 'basic'
  ): number {
    const serviceCost = SERVICE_COSTS[serviceType];
    if (!serviceCost) {
      return SERVICE_COSTS['other'].priority[priority as keyof typeof SERVICE_COSTS.other.priority];
    }

    const baseCost = serviceCost.priority[priority as keyof typeof serviceCost.priority];
    const tierBenefit = TIER_BENEFITS[tier];
    const discount = tierBenefit.discountPercentage;

    return Math.round(baseCost * (1 - discount / 100));
  }

  // Deduct tokens for service request
  async deductTokens(
    userId: string,
    serviceType: string,
    priority: string,
    requestId: string,
    description: string
  ): Promise<{ success: boolean; newBalance: number; cost: number; message?: string }> {
    try {
      const accountRef = doc(db, this.COLLECTIONS.ACCOUNTS, userId);

      return await runTransaction(db, async (transaction) => {
        const accountSnap = await transaction.get(accountRef);

        if (!accountSnap.exists()) {
          return { success: false, newBalance: 0, cost: 0, message: 'Token account not found' };
        }

        const account = accountSnap.data() as TokenAccount;
        const cost = this.calculateServiceCost(serviceType, priority, account.tier);

        if (account.balance < cost) {
          return {
            success: false,
            newBalance: account.balance,
            cost,
            message: `Insufficient tokens. Required: ${cost}, Available: ${account.balance}`
          };
        }

        const newBalance = account.balance - cost;
        const newTotalSpent = account.totalSpent + cost;

        // Update account
        transaction.update(accountRef, {
          balance: newBalance,
          totalSpent: newTotalSpent,
          updatedAt: serverTimestamp()
        });

        // Record transaction
        const transactionRef = doc(collection(db, this.COLLECTIONS.TRANSACTIONS));
        transaction.set(transactionRef, {
          accountId: userId,
          userId,
          type: 'service_request',
          amount: -cost,
          balanceBefore: account.balance,
          balanceAfter: newBalance,
          description,
          relatedRequestId: requestId,
          createdAt: serverTimestamp(),
          createdBy: userId
        });

        return { success: true, newBalance, cost };
      });
    } catch (error) {
      console.error('Error deducting tokens:', error);
      throw error;
    }
  }

  // Credit tokens (for refunds, bonuses, etc.)
  async creditTokens(
    userId: string,
    amount: number,
    type: TokenTransactionType,
    description: string,
    createdBy: string,
    relatedRequestId?: string
  ): Promise<{ success: boolean; newBalance: number }> {
    try {
      const accountRef = doc(db, this.COLLECTIONS.ACCOUNTS, userId);

      return await runTransaction(db, async (transaction) => {
        const accountSnap = await transaction.get(accountRef);

        if (!accountSnap.exists()) {
          return { success: false, newBalance: 0 };
        }

        const account = accountSnap.data() as TokenAccount;
        const newBalance = account.balance + amount;
        const newTotalEarned = account.totalEarned + amount;

        // Update account
        transaction.update(accountRef, {
          balance: newBalance,
          totalEarned: newTotalEarned,
          updatedAt: serverTimestamp()
        });

        // Record transaction
        const transactionRef = doc(collection(db, this.COLLECTIONS.TRANSACTIONS));
        transaction.set(transactionRef, {
          accountId: userId,
          userId,
          type,
          amount,
          balanceBefore: account.balance,
          balanceAfter: newBalance,
          description,
          relatedRequestId,
          createdAt: serverTimestamp(),
          createdBy
        });

        return { success: true, newBalance };
      });
    } catch (error) {
      console.error('Error crediting tokens:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(
    userId: string,
    limitCount: number = 50
  ): Promise<TokenTransaction[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.TRANSACTIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as TokenTransaction;
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  // Update tier based on balance
  async updateTier(userId: string): Promise<TokenTier> {
    try {
      const account = await this.getTokenAccount(userId);
      if (!account) throw new Error('Account not found');

      let newTier: TokenTier = 'basic';
      if (account.balance >= TIER_BENEFITS.platinum.minBalance) {
        newTier = 'platinum';
      } else if (account.balance >= TIER_BENEFITS.gold.minBalance) {
        newTier = 'gold';
      } else if (account.balance >= TIER_BENEFITS.silver.minBalance) {
        newTier = 'silver';
      }

      if (newTier !== account.tier) {
        const accountRef = doc(db, this.COLLECTIONS.ACCOUNTS, userId);
        await updateDoc(accountRef, {
          tier: newTier,
          updatedAt: serverTimestamp()
        });
      }

      return newTier;
    } catch (error) {
      console.error('Error updating tier:', error);
      throw error;
    }
  }

  // Record transaction (helper method)
  private async recordTransaction(
    transaction: Omit<TokenTransaction, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.COLLECTIONS.TRANSACTIONS), {
        ...transaction,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  }

  // Get token statistics
  async getTokenStatistics(userId: string) {
    const account = await this.getTokenAccount(userId);
    if (!account) return null;

    const tierBenefits = TIER_BENEFITS[account.tier];

    return {
      balance: account.balance,
      totalEarned: account.totalEarned,
      totalSpent: account.totalSpent,
      tier: account.tier,
      tierBenefits,
      discount: tierBenefits.discountPercentage,
      expiryDate: account.expiryDate,
      daysUntilExpiry: account.expiryDate
        ? Math.ceil((account.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    };
  }
}

export const tokenService = new TokenService();
export default tokenService;

// src/services/assetService.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Asset,
  AssetCategory,
  AssetStatus,
  AssetCondition,
  MaintenanceRecord,
  AssetCheckout,
  AssetStatistics,
  MaintenanceStatus
} from '../types/asset';

/**
 * Asset Management Service
 * Handles CRUD operations and business logic for industrial park assets
 */

class AssetService {
  private readonly assetsCollection = 'assets';
  private readonly maintenanceCollection = 'maintenanceRecords';
  private readonly checkoutCollection = 'assetCheckouts';

  /**
   * Create a new asset
   */
  async createAsset(
    assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<{ success: boolean; message: string; assetId?: string }> {
    try {
      // Generate asset code if not provided
      if (!assetData.assetCode) {
        assetData.assetCode = await this.generateAssetCode(assetData.category);
      }

      // Calculate current value based on depreciation
      const currentValue = this.calculateCurrentValue(
        assetData.purchaseCost,
        assetData.purchaseDate,
        assetData.depreciationRate
      );

      const docRef = await addDoc(collection(db, this.assetsCollection), {
        ...assetData,
        currentValue,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Asset created:', docRef.id);

      return {
        success: true,
        message: 'Asset created successfully',
        assetId: docRef.id
      };
    } catch (error: any) {
      console.error('Error creating asset:', error);
      return {
        success: false,
        message: error.message || 'Failed to create asset'
      };
    }
  }

  /**
   * Update an existing asset
   */
  async updateAsset(
    assetId: string,
    updates: Partial<Asset>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const assetRef = doc(db, this.assetsCollection, assetId);

      // Recalculate current value if relevant fields changed
      if (updates.purchaseCost || updates.purchaseDate || updates.depreciationRate) {
        const assetDoc = await getDoc(assetRef);
        const asset = assetDoc.data() as Asset;

        updates.currentValue = this.calculateCurrentValue(
          updates.purchaseCost || asset.purchaseCost,
          updates.purchaseDate || asset.purchaseDate,
          updates.depreciationRate || asset.depreciationRate
        );
      }

      await updateDoc(assetRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Asset updated:', assetId);

      return {
        success: true,
        message: 'Asset updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating asset:', error);
      return {
        success: false,
        message: error.message || 'Failed to update asset'
      };
    }
  }

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, this.assetsCollection, assetId));

      console.log('✅ Asset deleted:', assetId);

      return {
        success: true,
        message: 'Asset deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete asset'
      };
    }
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<Asset | null> {
    try {
      const docSnap = await getDoc(doc(db, this.assetsCollection, assetId));

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMaintenanceDate: data.lastMaintenanceDate?.toDate(),
          nextMaintenanceDate: data.nextMaintenanceDate?.toDate(),
          warrantyExpiry: data.warrantyExpiry?.toDate()
        } as Asset;
      }

      return null;
    } catch (error) {
      console.error('Error getting asset:', error);
      return null;
    }
  }

  /**
   * Get all assets for a park
   */
  async getAssetsByPark(parkId: string): Promise<Asset[]> {
    try {
      // Always fetch all assets to avoid Firestore composite index requirements
      const snapshot = await getDocs(collection(db, this.assetsCollection));
      let assets = snapshot.docs.map(doc => this.convertToAsset(doc));

      // Filter client-side if a specific park is requested
      if (parkId !== 'all') {
        assets = assets.filter(a => a.parkId === parkId);
      }

      // Sort client-side by createdAt descending (safe null check)
      assets.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });

      return assets;
    } catch (error) {
      console.error('Error getting assets by park:', error);
      return [];
    }
  }

  /**
   * Get assets by category
   */
  async getAssetsByCategory(category: AssetCategory): Promise<Asset[]> {
    try {
      const q = query(
        collection(db, this.assetsCollection),
        where('category', '==', category)
      );

      const snapshot = await getDocs(q);
      const assets = snapshot.docs.map(doc => this.convertToAsset(doc));
      return assets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting assets by category:', error);
      return [];
    }
  }

  /**
   * Get assets requiring maintenance
   */
  async getAssetsRequiringMaintenance(): Promise<Asset[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.assetsCollection),
        where('nextMaintenanceDate', '<=', now),
        orderBy('nextMaintenanceDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertToAsset(doc));
    } catch (error) {
      console.error('Error getting assets requiring maintenance:', error);
      return [];
    }
  }

  /**
   * Create maintenance record
   */
  async createMaintenanceRecord(
    record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<{ success: boolean; message: string; recordId?: string }> {
    try {
      const docRef = await addDoc(collection(db, this.maintenanceCollection), {
        ...record,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update asset's maintenance dates
      if (record.status === 'completed' && record.completedDate) {
        const asset = await this.getAsset(record.assetId);
        if (asset && asset.maintenanceInterval) {
          const nextDate = new Date(record.completedDate);
          nextDate.setDate(nextDate.getDate() + asset.maintenanceInterval);

          await this.updateAsset(record.assetId, {
            lastMaintenanceDate: record.completedDate,
            nextMaintenanceDate: nextDate
          });
        }
      }

      console.log('✅ Maintenance record created:', docRef.id);

      return {
        success: true,
        message: 'Maintenance record created successfully',
        recordId: docRef.id
      };
    } catch (error: any) {
      console.error('Error creating maintenance record:', error);
      return {
        success: false,
        message: error.message || 'Failed to create maintenance record'
      };
    }
  }

  /**
   * Update maintenance record
   */
  async updateMaintenanceRecord(
    recordId: string,
    updates: Partial<MaintenanceRecord>
  ): Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, this.maintenanceCollection, recordId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Maintenance record updated:', recordId);

      return {
        success: true,
        message: 'Maintenance record updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating maintenance record:', error);
      return {
        success: false,
        message: error.message || 'Failed to update maintenance record'
      };
    }
  }

  /**
   * Get maintenance records for an asset
   */
  async getMaintenanceRecords(assetId: string): Promise<MaintenanceRecord[]> {
    try {
      const q = query(
        collection(db, this.maintenanceCollection),
        where('assetId', '==', assetId),
        orderBy('scheduledDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate() || new Date(),
          completedDate: data.completedDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          nextOccurrence: data.nextOccurrence?.toDate()
        } as MaintenanceRecord;
      });
    } catch (error) {
      console.error('Error getting maintenance records:', error);
      return [];
    }
  }

  /**
   * Checkout an asset
   */
  async checkoutAsset(
    checkout: Omit<AssetCheckout, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update asset status
      await this.updateAsset(checkout.assetId, {
        status: 'reserved'
      });

      // Create checkout record
      await addDoc(collection(db, this.checkoutCollection), {
        ...checkout,
        status: 'checked-out',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Asset checked out:', checkout.assetId);

      return {
        success: true,
        message: 'Asset checked out successfully'
      };
    } catch (error: any) {
      console.error('Error checking out asset:', error);
      return {
        success: false,
        message: error.message || 'Failed to checkout asset'
      };
    }
  }

  /**
   * Return a checked-out asset
   */
  async returnAsset(
    checkoutId: string,
    returnCondition: AssetCondition,
    damageReported?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const checkoutRef = doc(db, this.checkoutCollection, checkoutId);
      const checkoutDoc = await getDoc(checkoutRef);

      if (!checkoutDoc.exists()) {
        return { success: false, message: 'Checkout record not found' };
      }

      const checkout = checkoutDoc.data() as AssetCheckout;

      // Update checkout record
      await updateDoc(checkoutRef, {
        actualReturnDate: new Date(),
        conditionAtReturn: returnCondition,
        damageReported: damageReported || null,
        status: 'returned',
        updatedAt: serverTimestamp()
      });

      // Update asset status and condition
      await this.updateAsset(checkout.assetId, {
        status: 'operational',
        condition: returnCondition
      });

      console.log('✅ Asset returned:', checkout.assetId);

      return {
        success: true,
        message: 'Asset returned successfully'
      };
    } catch (error: any) {
      console.error('Error returning asset:', error);
      return {
        success: false,
        message: error.message || 'Failed to return asset'
      };
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(parkId?: string): Promise<AssetStatistics> {
    try {
      let q;
      if (parkId) {
        q = query(collection(db, this.assetsCollection), where('parkId', '==', parkId));
      } else {
        q = query(collection(db, this.assetsCollection));
      }

      const snapshot = await getDocs(q);
      const assets = snapshot.docs.map(doc => this.convertToAsset(doc));

      // Calculate statistics
      const stats: AssetStatistics = {
        totalAssets: assets.length,
        totalValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
        assetsByCategory: {} as any,
        assetsByStatus: {} as any,
        assetsByCondition: {} as any,
        maintenanceDue: 0,
        maintenanceOverdue: 0,
        assetsUnderWarranty: 0,
        avgAssetAge: 0,
        avgMaintenanceInterval: 0,
        totalMaintenanceCost: 0
      };

      const now = new Date();
      let totalAge = 0;
      let totalInterval = 0;
      let intervalCount = 0;

      assets.forEach(asset => {
        // By category
        stats.assetsByCategory[asset.category] = (stats.assetsByCategory[asset.category] || 0) + 1;

        // By status
        stats.assetsByStatus[asset.status] = (stats.assetsByStatus[asset.status] || 0) + 1;

        // By condition
        stats.assetsByCondition[asset.condition] = (stats.assetsByCondition[asset.condition] || 0) + 1;

        // Maintenance tracking
        if (asset.nextMaintenanceDate) {
          if (asset.nextMaintenanceDate <= now) {
            stats.maintenanceOverdue++;
          } else if (asset.nextMaintenanceDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
            stats.maintenanceDue++;
          }
        }

        // Warranty
        if (asset.warrantyExpiry && asset.warrantyExpiry >= now) {
          stats.assetsUnderWarranty++;
        }

        // Age calculation
        const age = now.getTime() - asset.purchaseDate.getTime();
        totalAge += age / (1000 * 60 * 60 * 24); // Convert to days

        // Maintenance interval
        if (asset.maintenanceInterval) {
          totalInterval += asset.maintenanceInterval;
          intervalCount++;
        }
      });

      stats.avgAssetAge = assets.length > 0 ? Math.round(totalAge / assets.length) : 0;
      stats.avgMaintenanceInterval = intervalCount > 0 ? Math.round(totalInterval / intervalCount) : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating asset statistics:', error);
      return {
        totalAssets: 0,
        totalValue: 0,
        assetsByCategory: {} as any,
        assetsByStatus: {} as any,
        assetsByCondition: {} as any,
        maintenanceDue: 0,
        maintenanceOverdue: 0,
        assetsUnderWarranty: 0,
        avgAssetAge: 0,
        avgMaintenanceInterval: 0,
        totalMaintenanceCost: 0
      };
    }
  }

  /**
   * Generate unique asset code
   */
  private async generateAssetCode(category: AssetCategory): Promise<string> {
    const prefix = this.getCategoryPrefix(category);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get category prefix for asset code
   */
  private getCategoryPrefix(category: AssetCategory): string {
    const prefixes: Record<AssetCategory, string> = {
      'machinery': 'MAC',
      'vehicle': 'VEH',
      'infrastructure': 'INF',
      'it-equipment': 'IT',
      'furniture': 'FUR',
      'tool': 'TOOL',
      'safety-equipment': 'SAFE',
      'utility': 'UTIL',
      'other': 'OTH'
    };

    return prefixes[category];
  }

  /**
   * Calculate current value with depreciation
   */
  private calculateCurrentValue(
    purchaseCost: number,
    purchaseDate: Date,
    depreciationRate: number
  ): number {
    const years = (new Date().getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const depreciation = purchaseCost * (depreciationRate / 100) * years;
    return Math.max(0, purchaseCost - depreciation);
  }

  /**
   * Convert Firestore document to Asset
   */
  private convertToAsset(doc: any): Asset {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      purchaseDate: data.purchaseDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastMaintenanceDate: data.lastMaintenanceDate?.toDate(),
      nextMaintenanceDate: data.nextMaintenanceDate?.toDate(),
      warrantyExpiry: data.warrantyExpiry?.toDate()
    } as Asset;
  }
}

export const assetService = new AssetService();
export default assetService;

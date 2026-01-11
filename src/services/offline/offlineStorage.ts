// src/services/offline/offlineStorage.ts
import { db } from '../../db/schema';
import { ServiceRequest, SyncQueueItem } from '../../types';

export class OfflineStorageService {
  static async saveRequest(request: ServiceRequest): Promise<void> {
    try {
      await db.serviceRequests.put(request);
      console.log('💾 Saved request to local storage:', request.id);
    } catch (error) {
      console.error('❌ Error saving to local storage:', error);
      throw error;
    }
  }

  static async getAllRequests(): Promise<ServiceRequest[]> {
    try {
      return await db.serviceRequests.toArray();
    } catch (error) {
      console.error('❌ Error loading from local storage:', error);
      return [];
    }
  }

  static async getRequestsByTenant(tenantId: string): Promise<ServiceRequest[]> {
    try {
      return await db.serviceRequests.where('tenantId').equals(tenantId).toArray();
    } catch (error) {
      console.error('❌ Error loading tenant requests:', error);
      return [];
    }
  }

  static async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
    try {
      await db.syncQueue.add(item as SyncQueueItem);
      console.log('📝 Added to sync queue:', item.type);
    } catch (error) {
      console.error('❌ Error adding to sync queue:', error);
    }
  }

  static async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    try {
      return await db.syncQueue.where('status').equals('pending').toArray();
    } catch (error) {
      console.error('❌ Error getting sync queue:', error);
      return [];
    }
  }

  static async updateSyncItemStatus(
    id: number,
    status: 'pending' | 'syncing' | 'completed' | 'failed'
  ): Promise<void> {
    try {
      await db.syncQueue.update(id, { status });
    } catch (error) {
      console.error('❌ Error updating sync item:', error);
    }
  }

  static async clearCompletedSyncItems(): Promise<void> {
    try {
      await db.syncQueue.where('status').equals('completed').delete();
    } catch (error) {
      console.error('❌ Error clearing sync items:', error);
    }
  }
}
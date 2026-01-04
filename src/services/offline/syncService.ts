// src/services/offline/syncService.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db as firestore } from '../../config/firebase';
import { OfflineStorageService } from './offlineStorage';

export class SyncService {
  private static isSyncing = false;

  static async syncPendingChanges(onProgress?: (progress: number) => void): Promise<void> {
    if (this.isSyncing) {
      console.log('⏸️ Sync already in progress');
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Starting sync...');

    try {
      const pendingItems = await OfflineStorageService.getPendingSyncItems();
      console.log(`📋 Found ${pendingItems.length} items to sync`);

      if (pendingItems.length === 0) {
        this.isSyncing = false;
        return;
      }

      let completed = 0;

      for (const item of pendingItems) {
        try {
          await OfflineStorageService.updateSyncItemStatus(item.id!, 'syncing');

          const firestoreData = {
            ...item.data,
            createdAt: item.data.createdAt instanceof Date 
              ? Timestamp.fromDate(item.data.createdAt) 
              : Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await addDoc(collection(firestore, item.collection), firestoreData);
          await OfflineStorageService.updateSyncItemStatus(item.id!, 'completed');
          
          completed++;
          if (onProgress) onProgress((completed / pendingItems.length) * 100);
          
          console.log(`✅ Synced ${completed}/${pendingItems.length}`);
        } catch (error) {
          console.error('❌ Sync failed for item:', item, error);
          await OfflineStorageService.updateSyncItemStatus(item.id!, 'failed');
        }
      }

      await OfflineStorageService.clearCompletedSyncItems();
      console.log('🎉 Sync completed!');
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}
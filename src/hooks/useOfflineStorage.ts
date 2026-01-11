// src/hooks/useOfflineStorage.ts
import { useState, useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { ServiceRequest } from '../types';
import {
  getAllItems,
  getItemsByIndex,
  putItem,
  STORES,
} from '../utils/indexedDB';
import {
  queueFirestoreOperation,
  processQueue,
  getQueueStatus,
} from '../services/offlineQueue';

export const useOfflineStorage = (userId?: string, userRole?: string) => {
  const { isOnline } = useOnlineStatus();
  const [localRequests, setLocalRequests] = useState<ServiceRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Load local data on mount and when userId/userRole changes
  useEffect(() => {
    console.log('🔄 Loading local data for user:', userId, 'role:', userRole);
    loadLocalData();
  }, [userId, userRole]);

  const loadLocalData = async () => {
    try {
      console.log('📂 Attempting to load from IndexedDB...');
      let requests: ServiceRequest[];

      if (userRole === 'tenant' && userId) {
        console.log('👤 Loading tenant requests for:', userId);
        requests = await getItemsByIndex<ServiceRequest>(
          STORES.REQUESTS,
          'tenantId',
          userId
        );
      } else {
        console.log('👥 Loading all requests');
        requests = await getAllItems<ServiceRequest>(STORES.REQUESTS);
      }

      console.log('✅ Loaded', requests.length, 'requests from IndexedDB:', requests);
      setLocalRequests(requests);
    } catch (error) {
      console.error('❌ Error loading local data:', error);
      setLocalRequests([]);
    }
  };

  // Load pending sync count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const status = await getQueueStatus();
        setPendingSyncCount(status.total);
      } catch (error) {
        console.error('Error loading pending count:', error);
      }
    };
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveOfflineRequest = async (request: ServiceRequest) => {
    try {
      // Save to IndexedDB
      await putItem(STORES.REQUESTS, request);
      console.log('✅ Request saved to IndexedDB:', request.id);

      // Reload local data to update the list
      await loadLocalData();

      // Queue for Firestore sync (works both online and offline)
      await queueFirestoreOperation('create', 'serviceRequests', request);

      // Update pending count
      const status = await getQueueStatus();
      setPendingSyncCount(status.total);

      console.log('✅ Request queued for sync');
    } catch (error) {
      console.error('❌ Error saving offline request:', error);
      throw error;
    }
  };

  const handleSync = async () => {
    if (isSyncing || !isOnline) {
      console.warn('Cannot sync:', isSyncing ? 'Already syncing' : 'Offline');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      console.log('🔄 Starting manual sync...');

      // Process the queue
      const result = await processQueue();

      console.log(`✅ Sync complete: ${result.successful} successful, ${result.failed} failed`);

      // Update counts
      const status = await getQueueStatus();
      setPendingSyncCount(status.total);
      setSyncProgress(100);

      // Reload data to reflect synced items
      await loadLocalData();
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncProgress(0), 2000);
    }
  };

  return {
    localRequests,
    saveOfflineRequest,
    isSyncing,
    syncProgress,
    pendingSyncCount,
    handleSync,
    downloadAllData: async () => {},
    refreshLocalData: loadLocalData,
  };
};
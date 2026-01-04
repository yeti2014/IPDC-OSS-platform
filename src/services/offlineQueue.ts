// src/services/offlineQueue.ts
// Offline request queue for handling operations while offline

import {
  queueOperation,
  getQueuedOperations,
  dequeueOperation,
  QueuedOperation,
} from '../utils/indexedDB';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Maximum retry attempts for failed operations
const MAX_RETRY_ATTEMPTS = 3;

// Retry delay in milliseconds (exponential backoff)
const getRetryDelay = (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 30000);

/**
 * Queue a Firestore operation to be executed when online
 */
export async function queueFirestoreOperation(
  type: 'create' | 'update' | 'delete',
  collectionName: string,
  data: any,
  documentId?: string
): Promise<void> {
  const operation: QueuedOperation = {
    type,
    storeName: collectionName,
    data: {
      ...data,
      documentId,
      collectionName,
    },
    timestamp: Date.now(),
    retryCount: 0,
  };

  await queueOperation(operation);
  console.log('📝 Operation queued for sync:', type, collectionName);

  // Attempt immediate sync if online
  if (navigator.onLine) {
    processQueue().catch((error) => {
      console.error('Failed to process queue:', error);
    });
  }
}

/**
 * Process all queued operations
 */
export async function processQueue(): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ operation: QueuedOperation; error: any }>;
}> {
  if (!navigator.onLine) {
    console.log('⚠️ Cannot process queue: offline');
    return { successful: 0, failed: 0, errors: [] };
  }

  const operations = await getQueuedOperations();
  console.log(`🔄 Processing ${operations.length} queued operations...`);

  let successful = 0;
  let failed = 0;
  const errors: Array<{ operation: QueuedOperation; error: any }> = [];

  for (const operation of operations) {
    try {
      await executeOperation(operation);
      await dequeueOperation(operation.id!);
      successful++;
      console.log('✅ Operation synced successfully:', operation.type);
    } catch (error: any) {
      console.error('❌ Operation failed:', error);
      failed++;
      errors.push({ operation, error });

      // Retry logic with exponential backoff
      const retryCount = (operation.retryCount || 0) + 1;

      if (retryCount < MAX_RETRY_ATTEMPTS) {
        // Update retry count
        const updatedOperation = { ...operation, retryCount };
        await queueOperation(updatedOperation);

        // Schedule retry after delay
        const delay = getRetryDelay(retryCount);
        console.log(`⏳ Scheduling retry in ${delay}ms (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})`);

        setTimeout(() => {
          processQueue().catch(console.error);
        }, delay);
      } else {
        console.error('❌ Max retry attempts reached for operation:', operation);
        // Keep in queue for manual review/intervention
      }
    }
  }

  console.log(`✅ Queue processing complete: ${successful} successful, ${failed} failed`);

  return { successful, failed, errors };
}

/**
 * Execute a single queued operation
 */
async function executeOperation(operation: QueuedOperation): Promise<void> {
  const { type, data } = operation;
  const { collectionName, documentId, ...payload } = data;

  switch (type) {
    case 'create':
      await addDoc(collection(db, collectionName), payload);
      console.log('✅ Created document in Firestore:', collectionName);
      break;

    case 'update':
      if (!documentId) {
        throw new Error('Document ID required for update operation');
      }
      const updateRef = doc(db, collectionName, documentId);
      await updateDoc(updateRef, payload);
      console.log('✅ Updated document in Firestore:', documentId);
      break;

    case 'delete':
      if (!documentId) {
        throw new Error('Document ID required for delete operation');
      }
      const deleteRef = doc(db, collectionName, documentId);
      await deleteDoc(deleteRef);
      console.log('✅ Deleted document from Firestore:', documentId);
      break;

    default:
      throw new Error(`Unknown operation type: ${type}`);
  }
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<{
  total: number;
  byType: Record<string, number>;
  oldestTimestamp: number | null;
}> {
  const operations = await getQueuedOperations();

  const byType: Record<string, number> = {
    create: 0,
    update: 0,
    delete: 0,
  };

  let oldestTimestamp: number | null = null;

  operations.forEach((op) => {
    byType[op.type] = (byType[op.type] || 0) + 1;

    if (!oldestTimestamp || op.timestamp < oldestTimestamp) {
      oldestTimestamp = op.timestamp;
    }
  });

  return {
    total: operations.length,
    byType,
    oldestTimestamp,
  };
}

/**
 * Clear all queued operations
 */
export async function clearQueue(): Promise<void> {
  const operations = await getQueuedOperations();

  for (const operation of operations) {
    await dequeueOperation(operation.id!);
  }

  console.log('✅ Queue cleared');
}

/**
 * Auto-sync when connection is restored
 */
export function setupAutoSync(): void {
  // Process queue when coming back online
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored, processing queue...');
    processQueue().catch((error) => {
      console.error('Failed to process queue on reconnection:', error);
    });
  });

  // Periodic sync every 5 minutes when online
  setInterval(() => {
    if (navigator.onLine) {
      processQueue().catch((error) => {
        console.error('Periodic queue processing failed:', error);
      });
    }
  }, 5 * 60 * 1000);

  // Process queue on page visibility change (when user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine) {
      processQueue().catch((error) => {
        console.error('Failed to process queue on visibility change:', error);
      });
    }
  });

  console.log('✅ Auto-sync setup complete');
}

/**
 * Register background sync for modern browsers
 */
export async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if sync is supported on the registration object
      if ('sync' in registration) {
        await (registration as any).sync.register('sync-requests');
        console.log('✅ Background sync registered');
      } else {
        console.log('⚠️ Background sync not supported in this browser');
      }
    } catch (error) {
      console.error('❌ Failed to register background sync:', error);
    }
  } else {
    console.log('⚠️ Service Workers not supported, background sync unavailable');
  }
}

// Helper function to check if an operation is pending
export async function hasPendingOperations(): Promise<boolean> {
  const status = await getQueueStatus();
  return status.total > 0;
}

export default {
  queueFirestoreOperation,
  processQueue,
  getQueueStatus,
  clearQueue,
  setupAutoSync,
  registerBackgroundSync,
  hasPendingOperations,
};

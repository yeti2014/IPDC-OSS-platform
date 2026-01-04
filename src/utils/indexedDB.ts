// src/utils/indexedDB.ts
// IndexedDB wrapper for robust offline data storage

const DB_NAME = 'ipdc-offline-db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  REQUESTS: 'serviceRequests',
  QUEUE: 'requestQueue',
  PARKS: 'industrialParks',
  ASSETS: 'assets',
  INVOICES: 'invoices',
  TOKENS: 'tokens',
  METADATA: 'metadata',
} as const;

// Database instance cache
let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB with all required object stores
 */
export async function initIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('✅ IndexedDB initialized successfully');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('🔧 Upgrading IndexedDB schema...');

      // Service Requests store
      if (!db.objectStoreNames.contains(STORES.REQUESTS)) {
        const requestStore = db.createObjectStore(STORES.REQUESTS, {
          keyPath: 'id',
        });
        requestStore.createIndex('tenantId', 'tenantId', { unique: false });
        requestStore.createIndex('status', 'status', { unique: false });
        requestStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('✅ Created store:', STORES.REQUESTS);
      }

      // Request Queue store (for offline operations)
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = db.createObjectStore(STORES.QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('type', 'type', { unique: false });
        console.log('✅ Created store:', STORES.QUEUE);
      }

      // Industrial Parks store
      if (!db.objectStoreNames.contains(STORES.PARKS)) {
        const parkStore = db.createObjectStore(STORES.PARKS, {
          keyPath: 'id',
        });
        parkStore.createIndex('name', 'name', { unique: false });
        console.log('✅ Created store:', STORES.PARKS);
      }

      // Assets store
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        const assetStore = db.createObjectStore(STORES.ASSETS, {
          keyPath: 'id',
        });
        assetStore.createIndex('parkId', 'parkId', { unique: false });
        assetStore.createIndex('status', 'status', { unique: false });
        console.log('✅ Created store:', STORES.ASSETS);
      }

      // Invoices store
      if (!db.objectStoreNames.contains(STORES.INVOICES)) {
        const invoiceStore = db.createObjectStore(STORES.INVOICES, {
          keyPath: 'id',
        });
        invoiceStore.createIndex('tenantId', 'tenantId', { unique: false });
        invoiceStore.createIndex('status', 'status', { unique: false });
        console.log('✅ Created store:', STORES.INVOICES);
      }

      // Tokens store
      if (!db.objectStoreNames.contains(STORES.TOKENS)) {
        const tokenStore = db.createObjectStore(STORES.TOKENS, {
          keyPath: 'id',
        });
        tokenStore.createIndex('userId', 'userId', { unique: false });
        console.log('✅ Created store:', STORES.TOKENS);
      }

      // Metadata store (for sync status, last updated, etc.)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        console.log('✅ Created store:', STORES.METADATA);
      }
    };
  });
}

/**
 * Get database instance
 */
async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return initIndexedDB();
  }
  return dbInstance;
}

// ============================================================================
// Generic CRUD Operations
// ============================================================================

/**
 * Add or update a single item in a store
 */
export async function putItem<T>(
  storeName: string,
  item: T
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add multiple items to a store
 */
export async function putItems<T>(
  storeName: string,
  items: T[]
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    items.forEach((item) => {
      store.put(item);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Get a single item by key
 */
export async function getItem<T>(
  storeName: string,
  key: string | number
): Promise<T | undefined> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items from a store
 */
export async function getAllItems<T>(
  storeName: string
): Promise<T[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get items by index
 */
export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a single item by key
 */
export async function deleteItem(
  storeName: string,
  key: string | number
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all items from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Count items in a store
 */
export async function countItems(storeName: string): Promise<number> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// Specialized Operations
// ============================================================================

/**
 * Queue an operation to be performed when back online
 */
export interface QueuedOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  storeName: string;
  data: any;
  timestamp: number;
  retryCount?: number;
}

export async function queueOperation(operation: QueuedOperation): Promise<void> {
  const operationWithTimestamp = {
    ...operation,
    timestamp: Date.now(),
    retryCount: 0,
  };

  return putItem(STORES.QUEUE, operationWithTimestamp);
}

/**
 * Get all queued operations
 */
export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  return getAllItems<QueuedOperation>(STORES.QUEUE);
}

/**
 * Remove operation from queue
 */
export async function dequeueOperation(id: number): Promise<void> {
  return deleteItem(STORES.QUEUE, id);
}

/**
 * Set metadata value
 */
export async function setMetadata(key: string, value: any): Promise<void> {
  return putItem(STORES.METADATA, { key, value, updatedAt: Date.now() });
}

/**
 * Get metadata value
 */
export async function getMetadata(key: string): Promise<any> {
  const result = await getItem<{ key: string; value: any }>(
    STORES.METADATA,
    key
  );
  return result?.value;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  stores: Record<string, number>;
  totalItems: number;
}> {
  const stats: Record<string, number> = {};
  let totalItems = 0;

  for (const storeName of Object.values(STORES)) {
    const count = await countItems(storeName);
    stats[storeName] = count;
    totalItems += count;
  }

  return { stores: stats, totalItems };
}

/**
 * Clear all data from database
 */
export async function clearAllData(): Promise<void> {
  const promises = Object.values(STORES).map((storeName) =>
    clearStore(storeName)
  );
  await Promise.all(promises);
  console.log('✅ All IndexedDB data cleared');
}

/**
 * Export all data from database
 */
export async function exportData(): Promise<Record<string, any[]>> {
  const data: Record<string, any[]> = {};

  for (const storeName of Object.values(STORES)) {
    data[storeName] = await getAllItems(storeName);
  }

  return data;
}

/**
 * Import data into database
 */
export async function importData(
  data: Record<string, any[]>
): Promise<void> {
  const promises = Object.entries(data).map(([storeName, items]) =>
    putItems(storeName, items)
  );

  await Promise.all(promises);
  console.log('✅ Data imported successfully');
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initIndexedDB().catch((error) => {
    console.error('❌ Failed to initialize IndexedDB:', error);
  });
}

export default {
  initIndexedDB,
  putItem,
  putItems,
  getItem,
  getAllItems,
  getItemsByIndex,
  deleteItem,
  clearStore,
  countItems,
  queueOperation,
  getQueuedOperations,
  dequeueOperation,
  setMetadata,
  getMetadata,
  getDatabaseStats,
  clearAllData,
  exportData,
  importData,
};

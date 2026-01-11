// src/utils/offlineAuth.ts
/**
 * Offline Authentication Utilities
 * Caches user authentication data in IndexedDB for offline access
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AuthDB extends DBSchema {
  authState: {
    key: string;
    value: {
      uid: string;
      email: string | null;
      displayName: string | null;
      role: string;
      lastSync: Date;
    };
  };
  credentials: {
    key: string;
    value: {
      email: string;
      hashedPassword: string;
      lastLogin: Date;
    };
  };
}

const DB_NAME = 'ipdc-offline-auth';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<AuthDB> | null = null;

/**
 * Initialize the offline auth database
 */
export const initOfflineAuthDB = async (): Promise<IDBPDatabase<AuthDB>> => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<AuthDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create auth state store
      if (!db.objectStoreNames.contains('authState')) {
        db.createObjectStore('authState');
      }

      // Create credentials store for offline login
      if (!db.objectStoreNames.contains('credentials')) {
        db.createObjectStore('credentials');
      }
    },
  });

  console.log('✅ Offline auth database initialized');
  return dbInstance;
};

/**
 * Cache user authentication state
 */
export const cacheAuthState = async (userData: {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
}) => {
  try {
    const db = await initOfflineAuthDB();
    await db.put('authState', {
      ...userData,
      lastSync: new Date(),
    }, 'currentUser');
    console.log('✅ Auth state cached offline');
  } catch (error) {
    console.error('❌ Failed to cache auth state:', error);
  }
};

/**
 * Retrieve cached authentication state
 */
export const getCachedAuthState = async () => {
  try {
    const db = await initOfflineAuthDB();
    const authState = await db.get('authState', 'currentUser');

    if (authState) {
      console.log('✅ Retrieved cached auth state');
      return authState;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to retrieve cached auth state:', error);
    return null;
  }
};

/**
 * Clear cached authentication state (on logout)
 */
export const clearCachedAuthState = async () => {
  try {
    const db = await initOfflineAuthDB();
    await db.delete('authState', 'currentUser');
    console.log('✅ Cached auth state cleared');
  } catch (error) {
    console.error('❌ Failed to clear cached auth state:', error);
  }
};

/**
 * Simple hash function for password verification offline
 * Note: This is for offline verification only, not for security
 */
const simpleHash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Cache user credentials for offline login
 * Only stores hashed password for verification
 */
export const cacheCredentials = async (email: string, password: string) => {
  try {
    const db = await initOfflineAuthDB();
    const hashedPassword = await simpleHash(password);

    await db.put('credentials', {
      email,
      hashedPassword,
      lastLogin: new Date(),
    }, email.toLowerCase());

    console.log('✅ Credentials cached for offline login');
  } catch (error) {
    console.error('❌ Failed to cache credentials:', error);
  }
};

/**
 * Verify credentials offline
 */
export const verifyOfflineCredentials = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const db = await initOfflineAuthDB();
    const credentials = await db.get('credentials', email.toLowerCase());

    if (!credentials) {
      console.log('⚠️ No offline credentials found for this email');
      return false;
    }

    const hashedPassword = await simpleHash(password);
    const isValid = credentials.hashedPassword === hashedPassword;

    if (isValid) {
      console.log('✅ Offline credentials verified');
    } else {
      console.log('❌ Offline credentials verification failed');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Failed to verify offline credentials:', error);
    return false;
  }
};

/**
 * Check if user has offline access configured
 */
export const hasOfflineAccess = async (email: string): Promise<boolean> => {
  try {
    const db = await initOfflineAuthDB();
    const credentials = await db.get('credentials', email.toLowerCase());
    return credentials !== undefined;
  } catch (error) {
    console.error('❌ Failed to check offline access:', error);
    return false;
  }
};

/**
 * Clear all offline auth data
 */
export const clearAllOfflineAuthData = async () => {
  try {
    const db = await initOfflineAuthDB();
    await db.clear('authState');
    await db.clear('credentials');
    console.log('✅ All offline auth data cleared');
  } catch (error) {
    console.error('❌ Failed to clear offline auth data:', error);
  }
};

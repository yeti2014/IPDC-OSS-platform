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

const LAST_EMAIL_KEY = 'ipdc-last-login-email';

/**
 * Cache user authentication state, keyed by email so multiple accounts
 * on the same device each have their own offline profile.
 */
export const cacheAuthState = async (userData: {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
}) => {
  try {
    const key = userData.email?.toLowerCase();
    if (!key) return;
    const db = await initOfflineAuthDB();
    await db.put('authState', {
      ...userData,
      lastSync: new Date(),
    }, key);
    // Remember the last email so we can restore state without knowing it upfront
    localStorage.setItem(LAST_EMAIL_KEY, key);
    console.log('✅ Auth state cached offline');
  } catch (error) {
    console.error('❌ Failed to cache auth state:', error);
  }
};

/**
 * Retrieve cached authentication state for a specific email.
 * Falls back to the last-logged-in email when no email is supplied.
 */
export const getCachedAuthState = async (email?: string | null) => {
  try {
    const key = email?.toLowerCase() || localStorage.getItem(LAST_EMAIL_KEY);
    if (!key) return null;
    const db = await initOfflineAuthDB();
    const authState = await db.get('authState', key);
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

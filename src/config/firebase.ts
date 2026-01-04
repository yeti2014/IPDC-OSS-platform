// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Validate Firebase configuration
const validateConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missing);
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
};

validateConfig();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production and if supported)
export let analytics = null;
if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS !== 'false') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics enabled');
    }
  });
}

// Configure Firebase Auth to use local persistence (indefinite sessions)
// This persists authentication state across browser sessions indefinitely
const enableAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Firebase Auth persistence configured (indefinite sessions)');
  } catch (error) {
    console.error('❌ Failed to set auth persistence:', error);
  }
};

// Initialize auth persistence
enableAuthPersistence();

// Connect to emulators in development if enabled
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('🔧 Firebase Emulators connected');
}

// Enable Firestore offline persistence with multi-tab support
const enableOfflinePersistence = async () => {
  try {
    // Try multi-tab persistence first (allows multiple tabs to share the same cache)
    await enableMultiTabIndexedDbPersistence(db);
    console.log('✅ Firestore multi-tab offline persistence enabled');
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('⚠️ Multiple tabs open. Firestore persistence can only be enabled in one tab.');
      try {
        // Fall back to single-tab persistence
        await enableIndexedDbPersistence(db);
        console.log('✅ Firestore single-tab offline persistence enabled');
      } catch (error: any) {
        console.error('❌ Failed to enable single-tab persistence:', error);
      }
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('⚠️ Browser does not support Firestore offline persistence');
    } else {
      console.error('❌ Failed to enable Firestore persistence:', err);
    }
  }
};

// Initialize offline persistence
enableOfflinePersistence();

console.log('✅ Firebase initialized successfully');
console.log('📱 App Name:', import.meta.env.VITE_APP_NAME);
console.log('🔢 App Version:', import.meta.env.VITE_APP_VERSION);

export default app;
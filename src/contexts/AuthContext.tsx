// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  indexedDBLocalPersistence,  // Add this import
  setPersistence  // Add this import
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserRole } from '../types';
import {
  cacheAuthState,
  getCachedAuthState,
  clearCachedAuthState,
  cacheCredentials,
  verifyOfflineCredentials,
  initOfflineAuthDB,
} from '../utils/offlineAuth';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isOffline: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // NEW: Set Firebase auth persistence to IndexedDB (fixes mobile sign-in + offline)
  useEffect(() => {
    setPersistence(auth, indexedDBLocalPersistence)
      .then(() => console.log('✅ Firebase auth persistence set to IndexedDB (mobile/offline safe)'))
      .catch((error) => console.error('❌ Persistence error:', error));
  }, []);

  // Initialize offline auth database
  useEffect(() => {
    initOfflineAuthDB();
    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Your signIn/signUp/logOut unchanged (great offline fallback!)
  const signIn = async (email: string, password: string) => {
    // If offline, try offline authentication
    if (isOffline) {
      console.log('🔒 Attempting offline authentication...');
      const isValidOffline = await verifyOfflineCredentials(email, password);
      if (isValidOffline) {
        const cachedAuth = await getCachedAuthState();
        if (cachedAuth) {
          setUserData({
            uid: cachedAuth.uid,
            email: cachedAuth.email,
            displayName: cachedAuth.displayName,
            role: cachedAuth.role as UserRole,
          });
          console.log('✅ Offline authentication successful');
          return;
        } else {
          throw new Error('Offline credentials verified but no cached user data found. Please log in online first.');
        }
      } else {
        throw new Error('Invalid offline credentials. Please check your email and password or connect to the internet.');
      }
    }
    // Online authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await cacheCredentials(email, password);
      console.log('✅ Credentials cached for offline access');
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed') {
        console.log('⚠️ Network error, falling back to offline authentication...');
        setIsOffline(true);
        const isValidOffline = await verifyOfflineCredentials(email, password);
        if (isValidOffline) {
          const cachedAuth = await getCachedAuthState();
          if (cachedAuth) {
            setUserData({
              uid: cachedAuth.uid,
              email: cachedAuth.email,
              displayName: cachedAuth.displayName,
              role: cachedAuth.role as UserRole,
            });
            console.log('✅ Offline authentication successful (fallback)');
            return;
          }
        }
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    if (isOffline) {
      throw new Error('Signup requires an internet connection. Please connect to the internet and try again.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await cacheCredentials(email, password);
  };

  const logOut = async () => {
    await clearCachedAuthState();
    if (!isOffline) {
      await signOut(auth);
    } else {
      setCurrentUser(null);
      setUserData(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userDataObj = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: data.role as UserRole,
            };
            setUserData(userDataObj);
            await cacheAuthState(userDataObj);
          }
        } catch (error) {
          console.error('❌ Failed to fetch user data:', error);
          const cachedAuth = await getCachedAuthState();
          if (cachedAuth) {
            setUserData({
              uid: cachedAuth.uid,
              email: cachedAuth.email,
              displayName: cachedAuth.displayName,
              role: cachedAuth.role as UserRole,
            });
            console.log('✅ Loaded user data from offline cache');
          }
        }
      } else {
        if (isOffline) {
          const cachedAuth = await getCachedAuthState();
          if (cachedAuth) {
            setUserData({
              uid: cachedAuth.uid,
              email: cachedAuth.email,
              displayName: cachedAuth.displayName,
              role: cachedAuth.role as UserRole,
            });
            console.log('✅ Using cached auth state (offline mode)');
          } else {
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isOffline]);

  const value = { currentUser, userData, loading, isOffline, signIn, signUp, logOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

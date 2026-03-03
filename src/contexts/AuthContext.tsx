// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  setPersistence,
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

  const [persistenceReady, setPersistenceReady] = useState(false);

  // Initialize offline auth database + online/offline listener
  useEffect(() => {
    initOfflineAuthDB();
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set Firebase auth persistence BEFORE listening for auth state
  useEffect(() => {
    const initPersistence = async () => {
      try {
        // Race against a 5-second timeout — mobile PWA environments can hang on IndexedDB
        await Promise.race([
          setPersistence(auth, indexedDBLocalPersistence),
          new Promise<void>(resolve => setTimeout(resolve, 5000)),
        ]);
        console.log('✅ Firebase auth persistence set to IndexedDB');
      } catch {
        try {
          await Promise.race([
            setPersistence(auth, browserLocalPersistence),
            new Promise<void>(resolve => setTimeout(resolve, 3000)),
          ]);
          console.log('✅ Firebase auth persistence set to localStorage (fallback)');
        } catch (error) {
          console.error('❌ Failed to set Firebase persistence:', error);
        }
      }
      setPersistenceReady(true);
    };
    initPersistence();
  }, []);

  const signIn = async (email: string, password: string) => {
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
      await signInWithEmailAndPassword(auth, email, password);
      // Cache credentials for offline login
      await cacheCredentials(email, password);
      console.log('✅ Credentials cached for offline access');
    } catch (error: any) {
      // Fallback to offline if network error
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
    // Cache credentials for offline login
    await cacheCredentials(email, password);
  };

  const logOut = async () => {
    // Clear offline auth cache
    await clearCachedAuthState();
    if (!isOffline) {
      await signOut(auth);
    } else {
      // Offline logout - just clear local state
      setCurrentUser(null);
      setUserData(null);
    }
  };

  // Only start listening for auth state AFTER persistence is configured
  useEffect(() => {
    if (!persistenceReady) return;

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
  }, [isOffline, persistenceReady]);

  const value = { currentUser, userData, loading, isOffline, signIn, signUp, logOut };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        }}
      >
        <CircularProgress size={48} sx={{ color: 'white' }} />
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          Loading IPDC Platform...
        </Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  offlineDuration: number; // milliseconds
}

/**
 * Custom hook to detect online/offline status
 * Provides reliable network status with additional context
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const [offlineStartTime, setOfflineStartTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setLastOnlineTime(new Date());
      
      // Calculate how long we were offline
      if (offlineStartTime) {
        const duration = Date.now() - offlineStartTime.getTime();
        setOfflineDuration(duration);
        setOfflineStartTime(null);
      }

      // Clear "was offline" flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
      
      console.log('🟢 Network: Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineStartTime(new Date());
      console.log('🔴 Network: Went offline');
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Additional check: Try to fetch a small resource periodically
    // This catches cases where browser says "online" but network is actually down
    const checkConnection = async () => {
      if (!navigator.onLine) return;

      try {
        // Try to fetch Firebase (or any reliable endpoint)
        // Using a small resource with cache-busting
        await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors',
        });
        
        // If we get here, we're truly online
        if (!isOnline) {
          handleOnline();
        }
      } catch (error) {
        // Network request failed, we're actually offline
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Check connection every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);

    // Initial check
    checkConnection();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, offlineStartTime]);

  return {
    isOnline,
    wasOffline,
    lastOnlineTime,
    offlineDuration,
  };
}

/**
 * Format offline duration into human-readable string
 */
export function formatOfflineDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
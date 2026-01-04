import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  platform: string;
}

/**
 * Breakpoints (matching Material-UI defaults)
 */
const BREAKPOINTS = {
  mobile: 768,   // 0-767px = mobile
  tablet: 1024,  // 768-1023px = tablet
  // 1024+ = desktop
};

/**
 * Custom hook to detect device type and orientation
 * Detects mobile, tablet, desktop with responsive updates
 */
export function useDeviceDetection(): DeviceInfo {
  const getDeviceInfo = (): DeviceInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Determine device type based on screen width
    let type: DeviceType;
    if (width < BREAKPOINTS.mobile) {
      type = 'mobile';
    } else if (width < BREAKPOINTS.tablet) {
      type = 'tablet';
    } else {
      type = 'desktop';
    }

    // Check if it's a touch device
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0;

    // Determine orientation
    const isPortrait = height > width;
    const isLandscape = width > height;

    return {
      type,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
      screenWidth: width,
      screenHeight: height,
      isTouchDevice,
      isPortrait,
      isLandscape,
      platform: navigator.platform,
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo());

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation change (mobile devices)
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen to screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  return deviceInfo;
}

/**
 * Get device icon based on device type
 */
export function getDeviceIcon(type: DeviceType): string {
  switch (type) {
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📱'; // or use a different emoji
    case 'desktop':
      return '💻';
    default:
      return '📱';
  }
}

/**
 * Get device label
 */
export function getDeviceLabel(type: DeviceType): string {
  switch (type) {
    case 'mobile':
      return 'Mobile';
    case 'tablet':
      return 'Tablet';
    case 'desktop':
      return 'Desktop';
    default:
      return 'Unknown';
  }
}

/**
 * Check if device is in PWA mode (installed as app)
 */
export function isPWAInstalled(): boolean {
  // Check if running in standalone mode (installed PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check iOS standalone mode
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  return isStandalone || isIOSStandalone;
}

/**
 * Get OS type
 */
export function getOSType(): 'iOS' | 'Android' | 'Windows' | 'MacOS' | 'Linux' | 'Unknown' {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  if (/windows phone/i.test(userAgent)) {
    return 'Windows';
  }
  
  if (/android/i.test(userAgent)) {
    return 'Android';
  }
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'iOS';
  }
  
  if (/Mac/.test(userAgent)) {
    return 'MacOS';
  }
  
  if (/Linux/.test(userAgent)) {
    return 'Linux';
  }
  
  if (/Win/.test(userAgent)) {
    return 'Windows';
  }
  
  return 'Unknown';
}
# 📡 STATUS INDICATORS USAGE GUIDE
## Online/Offline & Device Mode Indicators

Complete guide to using the status indicators in your IPDC platform.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Online/Offline Indicators](#onlineoffline-indicators)
3. [Device Mode Indicators](#device-mode-indicators)
4. [Combined Status Bar](#combined-status-bar)
5. [Use Cases](#use-cases)
6. [Testing](#testing)
7. [Customization](#customization)

---

## 🚀 Quick Start

### Import the components you need:

```typescript
// Online/Offline indicators
import {
  OnlineStatusBadge,
  OnlineStatusIndicator,
  OnlineStatusWithSync,
  OfflineBanner,
} from '@/components/common/OnlineStatusIndicator';

// Device mode indicators
import {
  DeviceModeBadge,
  DeviceModeIndicator,
  DeviceInfoDisplay,
} from '@/components/common/DeviceModeIndicator';

// Combined status bar
import { StatusBar, StatusBarWithSync } from '@/components/common/StatusBar';

// Hooks for custom implementations
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
```

---

## 📶 Online/Offline Indicators

### 1. **OnlineStatusBadge** (Recommended for Navigation)

Compact badge perfect for navigation bars.

```typescript
import { OnlineStatusBadge } from '@/components/common/OnlineStatusIndicator';

function NavigationBar() {
  return (
    <AppBar>
      <Toolbar>
        <Typography>My App</Typography>
        <OnlineStatusBadge />  {/* ✅ Add this */}
      </Toolbar>
    </AppBar>
  );
}
```

**Shows:**
- 🟢 "Online" (green) when connected
- 🟠 "Offline" (orange) when disconnected
- Tooltip with additional info

---

### 2. **OfflineBanner** (Recommended for All Apps)

Full-width banner at the top that appears when offline.

```typescript
import { OfflineBanner } from '@/components/common/OnlineStatusIndicator';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <OfflineBanner />  {/* ✅ Add this at top */}
      <YourAppContent />
    </ThemeProvider>
  );
}
```

**Shows:**
- ⚠️ Warning banner when offline
- 🎉 Success banner when reconnected
- Auto-dismissible after 5 seconds

---

### 3. **OnlineStatusWithSync** (For Admin/Operations)

Detailed status with sync information.

```typescript
import { OnlineStatusWithSync } from '@/components/common/OnlineStatusIndicator';

function AdminDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueSize, setQueueSize] = useState(3);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  return (
    <Box>
      <OnlineStatusWithSync
        isSyncing={isSyncing}
        queueSize={queueSize}
        lastSyncTime={lastSyncTime}
      />
    </Box>
  );
}
```

**Shows:**
- Sync status (syncing/synced)
- Number of queued items
- Time since last sync
- Online/offline indicator

---

### 4. **OnlineStatusIndicator** (Detailed)

More detailed version with icon and status text.

```typescript
import { OnlineStatusIndicator } from '@/components/common/OnlineStatusIndicator';

function DashboardSidebar() {
  return (
    <Box sx={{ p: 2 }}>
      <OnlineStatusIndicator />
    </Box>
  );
}
```

---

### 5. **Custom Hook: useOnlineStatus**

Build your own custom indicator.

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function CustomComponent() {
  const { isOnline, wasOffline, offlineDuration } = useOnlineStatus();

  return (
    <Box>
      {isOnline ? (
        <Typography>✅ Connected</Typography>
      ) : (
        <Typography>⚠️ No connection</Typography>
      )}
      
      {wasOffline && (
        <Typography>
          Was offline for {formatDuration(offlineDuration)}
        </Typography>
      )}
    </Box>
  );
}
```

**Hook returns:**
```typescript
{
  isOnline: boolean;           // Current online status
  wasOffline: boolean;         // Just reconnected?
  lastOnlineTime: Date | null; // Last time online
  offlineDuration: number;     // How long offline (ms)
}
```

---

## 📱 Device Mode Indicators

### 1. **DeviceModeBadge** (Recommended for Navigation)

Compact badge showing device type.

```typescript
import { DeviceModeBadge } from '@/components/common/DeviceModeIndicator';

function NavigationBar() {
  return (
    <AppBar>
      <Toolbar>
        <Typography>My App</Typography>
        <DeviceModeBadge />  {/* Shows: 📱 Mobile / 💻 Desktop */}
      </Toolbar>
    </AppBar>
  );
}
```

**Shows:**
- 📱 "Mobile" (< 768px)
- 📱 "Tablet" (768-1023px)
- 💻 "Desktop" (≥ 1024px)
- Tooltip with screen dimensions

---

### 2. **DeviceInfoDisplay** (Complete Info)

Shows all device information at once.

```typescript
import { DeviceInfoDisplay } from '@/components/common/DeviceModeIndicator';

function SettingsPage() {
  return (
    <Box>
      <Typography variant="h6">Your Device</Typography>
      <DeviceInfoDisplay />
    </Box>
  );
}
```

**Shows:**
- Device type badge
- Orientation (mobile/tablet only)
- Operating system
- PWA install status

---

### 3. **Responsive Helper Text**

Shows helpful tips based on device orientation.

```typescript
import { ResponsiveHelperText } from '@/components/common/DeviceModeIndicator';

function FormPage() {
  return (
    <Box>
      <ResponsiveHelperText />  {/* Shows tips on mobile */}
      <YourForm />
    </Box>
  );
}
```

**Shows:**
- "💡 Tip: Rotate to landscape" (mobile portrait)
- "✅ Landscape mode active" (mobile landscape)
- Nothing on desktop

---

### 4. **Custom Hook: useDeviceDetection**

Build custom responsive logic.

```typescript
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

function ResponsiveComponent() {
  const device = useDeviceDetection();

  if (device.isMobile) {
    return <MobileView />;
  }
  
  if (device.isTablet) {
    return <TabletView />;
  }
  
  return <DesktopView />;
}
```

**Hook returns:**
```typescript
{
  type: 'mobile' | 'tablet' | 'desktop';
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
```

---

## 🎯 Combined Status Bar

### **StatusBar** (Recommended - All-in-One)

Complete status bar with everything you need.

```typescript
import { StatusBar } from '@/components/common/StatusBar';

function App() {
  return (
    <>
      <StatusBar 
        title="IPDC Platform"
        showMenu={true}
        onMenuClick={() => setDrawerOpen(true)}
      />
      <YourContent />
    </>
  );
}
```

**Includes:**
- ✅ Offline banner (auto-shows when offline)
- ✅ App title
- ✅ Online status badge
- ✅ Device mode badge
- ✅ PWA indicator
- ✅ Menu button (mobile)

---

### **StatusBarWithSync** (For Admin Views)

Status bar with detailed sync information.

```typescript
import { StatusBarWithSync } from '@/components/common/StatusBar';

function AdminDashboard() {
  const [syncState, setSyncState] = useSyncQueue();

  return (
    <>
      <StatusBarWithSync
        title="Admin Dashboard"
        isSyncing={syncState.isSyncing}
        queueSize={syncState.queueSize}
        lastSyncTime={syncState.lastSyncTime}
      />
      <DashboardContent />
    </>
  );
}
```

---

## 💼 Use Cases

### Use Case 1: **Tenant Request Form**

Show clear offline status when submitting requests.

```typescript
function NewRequestPage() {
  const { isOnline } = useOnlineStatus();
  
  return (
    <>
      <StatusBar title="New Request" />
      
      <Container>
        <Alert severity={isOnline ? "info" : "warning"}>
          {isOnline ? (
            "Request will be submitted immediately"
          ) : (
            "⚠️ You're offline. Request will be queued and submitted when online."
          )}
        </Alert>
        
        <RequestForm />
      </Container>
    </>
  );
}
```

---

### Use Case 2: **Admin Approval Dashboard**

Show sync status to admin users.

```typescript
function RequestApprovalPage() {
  const syncQueue = useSyncQueue();
  
  return (
    <>
      <StatusBarWithSync
        title="Pending Approvals"
        isSyncing={syncQueue.isSyncing}
        queueSize={syncQueue.queueSize}
        lastSyncTime={syncQueue.lastSyncTime}
      />
      
      <Container>
        {syncQueue.queueSize > 0 && (
          <Alert severity="info">
            {syncQueue.queueSize} action(s) pending sync
          </Alert>
        )}
        
        <RequestsList />
      </Container>
    </>
  );
}
```

---

### Use Case 3: **Operations Field Work**

Mobile-optimized view with clear offline support.

```typescript
function FieldWorkPage() {
  const { isOnline } = useOnlineStatus();
  const device = useDeviceDetection();
  
  return (
    <>
      <StatusBar title="Field Work" />
      
      <Container>
        <ResponsiveHelperText />
        
        {device.isMobile && !isOnline && (
          <Alert severity="success" icon={<CloudOffIcon />}>
            ✅ Offline mode active. All actions will sync automatically.
          </Alert>
        )}
        
        <WorkOrdersList />
      </Container>
    </>
  );
}
```

---

### Use Case 4: **Dashboard with Floating Indicators**

Show non-intrusive status in corner.

```typescript
import { FloatingStatusIndicators } from '@/components/common/StatusBar';

function Dashboard() {
  const syncState = useSyncQueue();
  
  return (
    <>
      <StatusBar title="Dashboard" />
      <DashboardContent />
      
      {/* Floating status in bottom-right (desktop only) */}
      <FloatingStatusIndicators
        isSyncing={syncState.isSyncing}
        queueSize={syncState.queueSize}
        lastSyncTime={syncState.lastSyncTime}
      />
    </>
  );
}
```

---

## 🧪 Testing Your Indicators

### Test 1: Online → Offline → Online

```bash
# Method 1: Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Offline" from dropdown
4. Watch indicators change!
5. Select "Online" to restore

# Method 2: System
1. Disconnect WiFi/Ethernet
2. Watch indicators update
3. Reconnect
4. See "Back Online" message
```

### Test 2: Device Responsiveness

```bash
# Method 1: Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select different devices
4. Rotate device
5. Watch indicators update

# Method 2: Resize Window
1. Resize browser window
2. Watch indicators change:
   - > 1024px = Desktop
   - 768-1023px = Tablet
   - < 768px = Mobile
```

### Test 3: PWA Installation

```bash
1. Deploy to Firebase Hosting (or use localhost with HTTPS)
2. Open in Chrome
3. Look for "Install" button in address bar
4. Install the app
5. PWA indicator should appear!
```

---

## 🎨 Customization

### Change Colors

Edit `src/config/theme.ts`:

```typescript
export const statusColors = {
  pending: {
    main: '#f59e0b',  // Change to your color
    light: '#fef3c7',
    dark: '#b45309',
  },
  // ... more colors
};
```

### Change Breakpoints

Edit `src/hooks/useDeviceDetection.ts`:

```typescript
const BREAKPOINTS = {
  mobile: 768,   // Change to 640 for smaller mobile threshold
  tablet: 1024,  // Change to 1280 for larger tablets
};
```

### Customize Badge Text

```typescript
// Instead of "Online/Offline", show custom text
<Chip
  label={isOnline ? 'Connected' : 'No Connection'}
  // ... rest of props
/>
```

### Add Custom Icons

```typescript
import { SignalWifi4Bar, SignalWifiOff } from '@mui/icons-material';

function CustomStatusBadge() {
  const { isOnline } = useOnlineStatus();
  
  return (
    <Chip
      icon={isOnline ? <SignalWifi4Bar /> : <SignalWifiOff />}
      label={isOnline ? 'Strong Signal' : 'No Signal'}
      color={isOnline ? 'success' : 'error'}
    />
  );
}
```

---

## 📚 Complete Component Reference

### Online/Offline Components

| Component | Size | Use Case |
|-----------|------|----------|
| `OnlineStatusBadge` | Small | Navigation bars |
| `OfflineBanner` | Full-width | Top of app |
| `OnlineStatusIndicator` | Medium | Dashboards |
| `OnlineStatusWithSync` | Large | Admin views |
| `OnlineStatusDot` | Tiny | Minimalist UI |
| `OnlineStatusText` | Text only | Dense layouts |

### Device Mode Components

| Component | Size | Use Case |
|-----------|------|----------|
| `DeviceModeBadge` | Small | Navigation bars |
| `DeviceModeIndicator` | Medium | Settings |
| `DeviceInfoDisplay` | Large | Debug/Info pages |
| `OrientationIndicator` | Small | Mobile only |
| `PWAStatusIndicator` | Small | When installed |
| `ResponsiveHelperText` | Medium | Forms/Complex UI |

### Combined Components

| Component | Use Case |
|-----------|----------|
| `StatusBar` | Main app navigation |
| `StatusBarWithSync` | Admin/Operations views |
| `FloatingStatusIndicators` | Non-intrusive status |
| `StatusFooter` | Mobile bottom status |

---

## 🐛 Troubleshooting

### Indicators not updating?

**Solution:** Make sure you're using the hooks at component level, not globally:

```typescript
// ❌ Wrong - outside component
const { isOnline } = useOnlineStatus();

function MyComponent() {
  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}

// ✅ Correct - inside component
function MyComponent() {
  const { isOnline } = useOnlineStatus();
  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}
```

### Device detection not working?

**Solution:** Make sure window resize listener is active. Try hard refresh (Ctrl+Shift+R).

### Offline detection delayed?

**Solution:** This is normal. Browser takes 2-5 seconds to detect network change. The additional polling checks help, but some delay is expected.

---

## ✅ Best Practices

1. **Always show offline status** - Users need to know when they're offline
2. **Use OfflineBanner** - Most user-friendly way to show status changes
3. **Test thoroughly** - Test all offline scenarios before deployment
4. **Mobile-first** - Status indicators should be visible on mobile
5. **Don't overdo it** - One or two indicators are enough
6. **Sync status matters** - Show sync status in admin/operations views

---

## 🎓 Next Steps

1. ✅ Implement StatusBar in your app
2. ✅ Add OfflineBanner at top level
3. ✅ Test offline functionality
4. ✅ Customize colors to match your brand
5. ✅ Add sync queue integration (Week 8)

---

**Questions? Check the demo in App.tsx or ask Claude for help!** 🚀

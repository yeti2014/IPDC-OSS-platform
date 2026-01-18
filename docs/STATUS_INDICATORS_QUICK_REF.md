# 📡 STATUS INDICATORS - QUICK REFERENCE

## 🚀 Just Want to Add Status Indicators? Use This!

### Step 1: Copy These 5 Files to Your Project

```
src/
├── hooks/
│   ├── useOnlineStatus.ts          ← Online/offline detection
│   └── useDeviceDetection.ts       ← Device type detection
└── components/
    └── common/
        ├── OnlineStatusIndicator.tsx  ← Online/offline UI
        ├── DeviceModeIndicator.tsx    ← Device mode UI
        └── StatusBar.tsx               ← Combined status bar
```

### Step 2: Add to Your App (2 lines of code!)

```typescript
// src/App.tsx
import { StatusBar } from './components/common/StatusBar';

function App() {
  return (
    <>
      <StatusBar title="My App" />  {/* ✅ Add this line */}
      <YourAppContent />
    </>
  );
}
```

**That's it! You now have:**
- ✅ Online/offline indicator
- ✅ Device type badge (mobile/tablet/desktop)
- ✅ Offline banner (auto-shows)
- ✅ PWA install status

---

## 🎯 Common Patterns

### Pattern 1: Simple App

```typescript
import { StatusBar } from '@/components/common/StatusBar';

function App() {
  return (
    <>
      <StatusBar title="IPDC Platform" />
      <YourPages />
    </>
  );
}
```

### Pattern 2: With Sync Status (Admin Views)

```typescript
import { StatusBarWithSync } from '@/components/common/StatusBar';

function AdminDashboard() {
  return (
    <>
      <StatusBarWithSync
        title="Admin Dashboard"
        isSyncing={false}
        queueSize={3}
      />
      <DashboardContent />
    </>
  );
}
```

### Pattern 3: Custom Implementation

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

function CustomComponent() {
  const { isOnline } = useOnlineStatus();
  const { isMobile } = useDeviceDetection();
  
  return (
    <Box>
      {!isOnline && <Alert severity="warning">Offline</Alert>}
      {isMobile && <MobileView />}
    </Box>
  );
}
```

---

## 📱 Individual Components

### Online/Offline

```typescript
import { 
  OnlineStatusBadge,      // Small badge
  OfflineBanner,          // Full-width banner
  OnlineStatusWithSync,   // With sync info
} from '@/components/common/OnlineStatusIndicator';

// Use anywhere
<OnlineStatusBadge />
```

### Device Mode

```typescript
import { 
  DeviceModeBadge,        // Small badge
  DeviceInfoDisplay,      // Complete info
  PWAStatusIndicator,     // PWA status
} from '@/components/common/DeviceModeIndicator';

// Use anywhere
<DeviceModeBadge />
```

---

## 🧪 Testing

### Test Offline
1. Open DevTools (F12)
2. Network tab → Select "Offline"
3. Watch indicators change!

### Test Device Modes
1. Resize browser window
2. Or: DevTools → Device Toolbar (Ctrl+Shift+M)
3. Watch indicators update!

---

## 🎨 What It Looks Like

### Online Mode
```
┌─────────────────────────────────────┐
│ 🏭 IPDC Platform  🟢 Online 💻 Desktop │
└─────────────────────────────────────┘
```

### Offline Mode
```
┌─────────────────────────────────────────────┐
│ ⚠️ You're Offline                            │
│ Don't worry - you can continue working.     │
│ All changes will sync when you're online.   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ 🏭 IPDC Platform  🟠 Offline 📱 Mobile      │
└─────────────────────────────────────────────┘
```

### Reconnected
```
┌─────────────────────────────────────────────┐
│ 🎉 Back Online!                              │
│ Connection restored after 2m 30s.            │
│ Your data will sync automatically.           │
└─────────────────────────────────────────────┘
```

---

## ✨ Features Included

✅ **Automatic offline detection**
✅ **Reconnection notifications**
✅ **Device type detection** (mobile/tablet/desktop)
✅ **Orientation detection** (portrait/landscape)
✅ **PWA install status**
✅ **Sync queue display**
✅ **Responsive design**
✅ **TypeScript types included**
✅ **Customizable styling**

---

## 📚 Full Documentation

See `STATUS_INDICATORS_GUIDE.md` for:
- Complete API reference
- All component variants
- Customization examples
- Advanced use cases
- Troubleshooting tips

---

## 💡 Tips

1. **Always use StatusBar** - Easiest way to get started
2. **OfflineBanner is automatic** - Shows when offline, hides when online
3. **Test on real devices** - Emulators don't fully simulate offline behavior
4. **Customize colors** - Edit theme.ts to match your brand
5. **Mobile-first** - Status indicators work great on mobile!

---

## 🆘 Quick Help

**Not updating?** → Use hooks inside components, not outside

**Delayed detection?** → Normal, browser takes 2-5 seconds

**Want custom styling?** → All components accept `sx` prop

**Need help?** → Check STATUS_INDICATORS_GUIDE.md or ask!

---

**That's it! You're ready to go! 🚀**

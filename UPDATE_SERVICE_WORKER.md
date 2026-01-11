# How to Update Service Worker

The service worker has been updated to **v1.0.1** with the following fixes:

## ✅ Changes Made

1. **Increased Cache Limits**
   - Runtime Cache: 50 → 200 items
   - Image Cache: 30 → 100 items

2. **Fixed Background Sync**
   - Properly handles IndexedDB async operations
   - Validates queue data before iteration
   - Better error handling

3. **Reduced Console Noise**
   - Only logs cache trimming when 10+ items removed
   - Filters out invalid service worker messages

## 🔄 How to Update

### Option 1: Hard Refresh (Recommended)
1. **Close ALL browser tabs** with the app
2. **Reopen** the app in a new tab
3. The new service worker will install automatically
4. **Refresh the page** once you see "New version available! Please refresh."

### Option 2: Manual Update via DevTools
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Find "http://localhost:5173" service worker
5. Click **Unregister**
6. Close DevTools
7. **Hard refresh** the page (Ctrl+Shift+R)

### Option 3: Clear Everything
```javascript
// Run in console:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Then hard refresh (Ctrl+Shift+R)
```

## ✅ Verify Update

After updating, check console for:
```
[Service Worker] Installing service worker... ipdc-v1.0.1
[Service Worker] Caching static assets
[Service Worker] Installation complete
✅ Service Worker registered
```

## 🎯 Expected Behavior

### Before Update (v1.0.0)
- Hundreds of "Trimmed X items" messages
- Background sync errors
- "Unknown message type" warnings

### After Update (v1.0.1)
- Clean console
- No trim messages (unless 10+ items)
- Background sync works properly
- No unknown message warnings

## 🧪 Test Offline Functionality

1. **Go to DevTools → Network**
2. **Select "Offline"** from throttling dropdown
3. **Create a service request** while offline
4. **Go back online**
5. **Observe auto-sync** in console

You should see:
```
✅ Request saved to IndexedDB
✅ Request queued for sync
🌐 Connection restored, processing queue...
🔄 Processing 1 queued operations...
✅ Operation synced successfully
✅ Queue processing complete
```

## 🆘 Troubleshooting

### Service worker not updating?
- Try closing ALL tabs and reopening
- Clear browser cache entirely
- Check if running on HTTPS or localhost

### Still seeing old version?
- Check Application → Service Workers shows v1.0.1
- Try incognito mode
- Restart browser completely

### Errors persist?
- Check console for specific error messages
- Ensure IndexedDB is enabled
- Verify Firebase connection

---

**Version:** 1.0.1
**Last Updated:** January 2026

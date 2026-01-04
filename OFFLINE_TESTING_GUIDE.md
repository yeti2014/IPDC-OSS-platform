# Offline Functionality - Quick Testing Guide

## Prerequisites
- Application running on localhost or HTTPS
- Modern browser (Chrome 84+, Firefox 78+, Safari 14+)
- DevTools open (F12)

## Quick Test Checklist

### ✅ Test 1: Service Worker Registration
**Expected:** Service worker successfully registers

1. Open DevTools → Console
2. Look for log: `✅ Service Worker registered: /`
3. Open DevTools → Application → Service Workers
4. Verify service worker is **activated and running**

**Pass Criteria:**
- ✅ Service worker shows as "activated"
- ✅ Console shows registration success
- ✅ No registration errors

---

### ✅ Test 2: IndexedDB Initialization
**Expected:** IndexedDB creates with all required stores

1. Open DevTools → Application → IndexedDB
2. Expand `ipdc-offline-db`
3. Verify all stores exist:
   - serviceRequests
   - requestQueue
   - industrialParks
   - assets
   - invoices
   - tokens
   - metadata

**Pass Criteria:**
- ✅ Database created
- ✅ All 7 stores present
- ✅ Console shows: `✅ IndexedDB initialized`

---

### ✅ Test 3: Firestore Offline Persistence
**Expected:** Firestore enables offline persistence

1. Check console for:
   - `✅ Firestore multi-tab offline persistence enabled` OR
   - `✅ Firestore single-tab offline persistence enabled`
2. No persistence errors

**Pass Criteria:**
- ✅ Persistence enabled successfully
- ✅ No "failed-precondition" errors (unless multiple tabs open)

---

### ✅ Test 4: Static Asset Caching
**Expected:** Service worker caches static assets

1. Reload page (Ctrl+R)
2. Open DevTools → Network tab
3. Filter by JS or CSS
4. Look for resources served from Service Worker

**Pass Criteria:**
- ✅ Some assets show "(ServiceWorker)" in Size column
- ✅ Cache Storage contains `ipdc-cache-v1.0.0`

---

### ✅ Test 5: Create Request While Online
**Expected:** Request saves to both Firestore and IndexedDB

**Steps:**
1. Login as tenant
2. Navigate to Dashboard
3. Click "Create New Request"
4. Fill out form and submit
5. Check Console for:
   - `✅ Request saved to IndexedDB`
   - `✅ Request queued for sync`

**Verify:**
1. DevTools → Application → IndexedDB → ipdc-offline-db → serviceRequests
2. Should contain your new request
3. DevTools → Application → IndexedDB → requestQueue
4. Should show 1 queued operation (briefly, then syncs)

**Pass Criteria:**
- ✅ Request appears in UI immediately
- ✅ Request saved to IndexedDB
- ✅ Request synced to Firestore
- ✅ Queue processed automatically

---

### ✅ Test 6: Go Offline
**Expected:** App shows offline indicators

**Steps:**
1. Open DevTools → Network tab
2. Select **Offline** from throttling dropdown (or use airplane mode)
3. Observe UI changes

**Pass Criteria:**
- ✅ Offline banner appears: "You're Offline"
- ✅ Status bar chip shows "Offline"
- ✅ Sync button disabled or shows "Offline" state

---

### ✅ Test 7: Create Request While Offline
**Expected:** Request saves locally and queues for sync

**Steps:**
1. Ensure still offline
2. Create another service request
3. Fill form and submit

**Verify:**
1. Request appears in list immediately
2. Console shows:
   - `✅ Request saved to IndexedDB`
   - `✅ Request queued for sync`
3. Check IndexedDB → requestQueue
   - Should show pending operation

**Pass Criteria:**
- ✅ Request created successfully
- ✅ Shows in UI immediately
- ✅ Saved to IndexedDB
- ✅ Added to sync queue
- ✅ Pending count increases

---

### ✅ Test 8: View Cached Data Offline
**Expected:** Previously loaded data still accessible

**Steps:**
1. Still offline
2. Navigate between pages
3. Try to view:
   - Dashboard (service requests)
   - Industrial Parks (if visited before)
   - Profile

**Pass Criteria:**
- ✅ Previously viewed data still displays
- ✅ No blank pages or errors
- ✅ Navigation works smoothly
- ✅ Offline banner remains visible

---

### ✅ Test 9: Offline Sync Manager
**Expected:** Shows pending operations status

**Steps:**
1. While offline with queued requests
2. Look for sync status indicator
3. Check pending count

**Pass Criteria:**
- ✅ Shows "X to sync" or "X pending"
- ✅ Displays operation count correctly
- ✅ Sync button disabled while offline
- ✅ Shows breakdown by type (if details expanded)

---

### ✅ Test 10: Return Online - Auto Sync
**Expected:** Queued operations sync automatically

**Steps:**
1. Go back online (Network → No throttling, or disable airplane mode)
2. Observe UI and console

**Verify Console:**
- `🌐 Connection restored, processing queue...`
- `🔄 Processing X queued operations...`
- `✅ Operation synced successfully`
- `✅ Queue processing complete`

**Verify UI:**
- Offline banner changes to "Back Online"
- Sync indicator shows syncing progress
- Pending count decreases to 0
- Success notification appears

**Pass Criteria:**
- ✅ Auto-sync triggers on reconnection
- ✅ All queued operations process
- ✅ UI updates to show synced state
- ✅ Data appears in Firestore

---

### ✅ Test 11: Manual Sync
**Expected:** User can trigger sync manually

**Steps:**
1. Create request while offline
2. Go online but DON'T wait for auto-sync
3. Click "Sync Now" button immediately

**Pass Criteria:**
- ✅ Sync starts on button click
- ✅ Progress indicator shows
- ✅ Queue processes successfully
- ✅ Button disabled during sync
- ✅ Count updates after sync

---

### ✅ Test 12: Offline Fallback Page
**Expected:** Custom offline page shows for uncached pages

**Steps:**
1. Go offline
2. Try to navigate to a URL not in cache (e.g., add `/test` to URL)
3. Should show offline.html

**Pass Criteria:**
- ✅ Shows custom offline page
- ✅ Page explains offline features
- ✅ Shows offline status
- ✅ "Try Again" button present

---

### ✅ Test 13: Background Sync (if supported)
**Expected:** Syncs happen periodically in background

**Steps:**
1. Create request while offline
2. Go online
3. Minimize browser or switch tabs
4. Wait 5 minutes

**Pass Criteria:**
- ✅ Sync happens without user action
- ✅ Console shows periodic sync logs (every 5 min)
- ✅ Queue processes in background

**Note:** Background sync may not work in all browsers

---

### ✅ Test 14: Multiple Tabs
**Expected:** Firestore persistence handles multiple tabs gracefully

**Steps:**
1. Open app in Tab 1
2. Open app in Tab 2 (same browser)
3. Check console in Tab 2

**Pass Criteria:**
- ✅ Tab 1: Multi-tab persistence enabled
- ✅ Tab 2: Warning about multiple tabs (expected)
- ✅ Both tabs functional
- ✅ No crashes or errors

---

### ✅ Test 15: Retry Logic
**Expected:** Failed operations retry with backoff

**Steps:**
1. Create request offline
2. Go online but simulate Firestore error (disable Firebase in DevTools)
3. Observe retry attempts

**Expected Console:**
- `❌ Operation failed`
- `⏳ Scheduling retry in 1000ms (attempt 1/3)`
- Second attempt after 2s
- Third attempt after 4s

**Pass Criteria:**
- ✅ Operation retries automatically
- ✅ Exponential backoff applied
- ✅ Max 3 attempts enforced
- ✅ Error logged if all fail

---

## Quick Command Reference

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered SWs:', registrations.length);
  registrations.forEach(reg => console.log('Scope:', reg.scope));
});
```

### Check IndexedDB Stores
```javascript
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
});
```

### Manually Trigger Sync
```javascript
// In browser console
import { processQueue } from './services/offlineQueue';
processQueue();
```

### Check Queue Status
```javascript
import { getQueueStatus } from './services/offlineQueue';
getQueueStatus().then(status => console.log(status));
```

### Clear Cache
```javascript
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('All caches cleared');
});
```

### Unregister Service Worker
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('All service workers unregistered');
});
```

---

## Common Issues & Solutions

### Issue: Service Worker not registering
**Symptoms:** No console log, Application tab shows no SW
**Solutions:**
- Ensure running on localhost or HTTPS
- Check browser supports service workers
- Clear cache and hard reload (Ctrl+Shift+R)
- Check `/service-worker.js` file exists in public folder

### Issue: Auto-sync not working
**Symptoms:** Queue doesn't process when back online
**Solutions:**
- Check console for errors
- Verify `setupAutoSync()` called in App.tsx
- Check network tab for Firestore requests
- Manually trigger sync to test queue

### Issue: Data not persisting
**Symptoms:** Data disappears on reload
**Solutions:**
- Check IndexedDB in Application tab
- Verify `putItem()` calls succeed
- Check browser storage quota
- Verify no private/incognito mode

### Issue: "Failed-precondition" error
**Symptoms:** Firestore persistence fails in one tab
**Expected:** This is normal with multiple tabs
**Solution:** Close other tabs or ignore (fallback works)

---

## Performance Benchmarks

### Expected Performance
- **Service Worker Registration:** < 100ms
- **IndexedDB Init:** < 50ms
- **Save to IndexedDB:** < 10ms
- **Queue Processing (1 item):** < 500ms
- **Cache Lookup:** < 5ms
- **First Paint (cached):** < 500ms

### Storage Usage
- **Service Worker Cache:** ~5-10 MB
- **IndexedDB:** Varies by data (typically 1-5 MB)
- **Firestore Cache:** Varies by queries (typically 5-20 MB)

---

## Sign-Off Checklist

Before marking offline functionality as complete:

- [ ] All 15 tests pass
- [ ] Service worker registers successfully
- [ ] IndexedDB initializes with all stores
- [ ] Firestore persistence enabled
- [ ] Requests create offline successfully
- [ ] Queue processes on reconnection
- [ ] Manual sync works
- [ ] Auto-sync works
- [ ] UI indicators accurate
- [ ] No console errors
- [ ] Multiple tabs handled gracefully
- [ ] Retry logic functional
- [ ] Documentation complete

---

**Testing Completed By:** _______________
**Date:** _______________
**Browser Tested:** _______________
**All Tests Passed:** ☐ Yes ☐ No

**Notes:**
_______________________________________
_______________________________________
_______________________________________

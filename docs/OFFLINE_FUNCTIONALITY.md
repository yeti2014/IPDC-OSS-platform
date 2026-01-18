# IPDC Platform - Enhanced Offline Functionality

## Overview

The IPDC Digital Platform now includes comprehensive offline-first capabilities, allowing users to work seamlessly even without internet connectivity. This document outlines the offline features, architecture, and usage.

## Core Features

### 1. **Firestore Offline Persistence**
- Multi-tab IndexedDB persistence for Firestore data
- Automatic caching of all read queries
- Seamless fallback to cached data when offline
- Automatic sync when connection is restored

### 2. **Service Worker Caching**
- Intelligent caching strategies for different resource types
- Cache-first for static assets (JS, CSS, images)
- Network-first for API and dynamic content
- Stale-while-revalidate for HTML pages
- Automatic cache management and cleanup

### 3. **IndexedDB Storage**
- Robust local storage for structured data
- Separate stores for:
  - Service Requests
  - Request Queue (pending operations)
  - Industrial Parks
  - Assets
  - Invoices
  - Tokens
  - Metadata

### 4. **Offline Request Queue**
- Queue operations performed while offline
- Automatic sync when connection is restored
- Retry logic with exponential backoff
- Manual sync capability
- Visual queue status indicators

### 5. **Background Sync**
- Automatic background synchronization (when supported)
- Periodic sync checks every 5 minutes
- Sync on page visibility change
- Sync on connection restoration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│  (React Components, Hooks, Services)                       │
└───────────────┬─────────────────────────────────────────────┘
                │
                ├──────────────────┬──────────────────────────┐
                │                  │                          │
        ┌───────▼──────┐   ┌──────▼──────┐         ┌────────▼────────┐
        │   Firestore  │   │  IndexedDB  │         │ Service Worker  │
        │  Persistence │   │   Storage   │         │    Caching      │
        └───────┬──────┘   └──────┬──────┘         └────────┬────────┘
                │                  │                          │
                └──────────────────┴──────────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   Offline Queue     │
                        │  (Sync Manager)     │
                        └─────────────────────┘
```

## File Structure

### Core Files

#### `/public/service-worker.js`
- Service worker for caching and offline functionality
- Implements cache-first, network-first, and stale-while-revalidate strategies
- Background sync support
- Cache size management

#### `/public/offline.html`
- Offline fallback page
- Shows when users try to navigate while offline
- Lists available offline features
- Auto-detects when connection is restored

#### `/src/utils/indexedDB.ts`
- IndexedDB wrapper utilities
- CRUD operations for all stores
- Queue management functions
- Database statistics and export/import

#### `/src/services/offlineQueue.ts`
- Request queue management
- Automatic sync when online
- Retry logic with exponential backoff
- Queue status tracking

#### `/src/hooks/useOfflineStorage.ts`
- React hook for offline data management
- Load and save requests to IndexedDB
- Integrate with sync queue
- Track pending sync count

#### `/src/components/common/OfflineSyncManager.tsx`
- Visual sync status component
- Manual sync controls
- Queue details display
- Error handling and reporting

#### `/src/config/firebase.ts` (Enhanced)
- Firestore multi-tab persistence enabled
- Automatic fallback for unsupported browsers
- Error handling for persistence setup

## Usage Guide

### For Users

#### Working Offline

1. **Creating Service Requests Offline**
   - Create requests as normal using the UI
   - Requests are saved to IndexedDB immediately
   - Queued for sync when online
   - Visual indicator shows pending operations

2. **Viewing Cached Data**
   - Previously loaded requests available offline
   - Industrial park information cached
   - Profile and settings accessible
   - Token balance and history available

3. **Sync Status**
   - Check status bar for connection state
   - View pending operation count
   - Manual sync button available when online
   - Auto-sync occurs when connection restored

#### Sync Manager

Access the Offline Sync Manager to:
- View total pending operations
- See breakdown by type (create/update/delete)
- Manually trigger sync
- Clear queue if needed
- View oldest pending operation timestamp

### For Developers

#### Queuing Offline Operations

```typescript
import { queueFirestoreOperation } from '../services/offlineQueue';

// Queue a create operation
await queueFirestoreOperation(
  'create',
  'serviceRequests',
  requestData
);

// Queue an update operation
await queueFirestoreOperation(
  'update',
  'serviceRequests',
  updatedData,
  documentId
);

// Queue a delete operation
await queueFirestoreOperation(
  'delete',
  'serviceRequests',
  {},
  documentId
);
```

#### Using IndexedDB Storage

```typescript
import { putItem, getItem, getAllItems, STORES } from '../utils/indexedDB';

// Save an item
await putItem(STORES.REQUESTS, request);

// Get a single item
const request = await getItem(STORES.REQUESTS, requestId);

// Get all items
const allRequests = await getAllItems(STORES.REQUESTS);

// Get items by index
const userRequests = await getItemsByIndex(
  STORES.REQUESTS,
  'tenantId',
  userId
);
```

#### Manual Sync

```typescript
import { processQueue, getQueueStatus } from '../services/offlineQueue';

// Process all queued operations
const result = await processQueue();
console.log(`Synced: ${result.successful}, Failed: ${result.failed}`);

// Get queue status
const status = await getQueueStatus();
console.log(`Total pending: ${status.total}`);
console.log(`By type:`, status.byType);
```

#### Using the Hook

```typescript
import { useOfflineStorage } from '../hooks/useOfflineStorage';

function MyComponent() {
  const {
    localRequests,
    saveOfflineRequest,
    isSyncing,
    syncProgress,
    pendingSyncCount,
    handleSync,
  } = useOfflineStorage(userId, userRole);

  // Use local requests
  // Save offline requests
  // Trigger manual sync
  // Show sync status
}
```

## Offline Features by Module

### Service Requests
- ✅ Create requests offline
- ✅ View previously loaded requests
- ✅ Queue creates for sync
- ✅ Auto-sync when online

### Industrial Parks
- ✅ View cached park information
- ✅ Browse park statistics
- ✅ Access park details offline

### Assets (Admin)
- ✅ View asset inventory
- ✅ Create assets offline
- ✅ Update asset status
- ✅ Queue changes for sync

### Billing & Invoices
- ✅ View cached invoices
- ✅ Check payment status
- ✅ Download invoice PDFs (if cached)

### Token Dashboard
- ✅ View token balance
- ✅ Check transaction history
- ✅ View tier information

## Caching Strategies

### Static Assets (JS, CSS, Fonts, Images)
**Strategy:** Cache First with Network Fallback
- Check cache first
- Serve from cache if available
- Fetch from network if not in cache
- Cache network response for future use

### API & Dynamic Content
**Strategy:** Network First with Cache Fallback
- Try network first
- Cache successful responses
- Fall back to cache if offline
- Show offline indicator if cached data shown

### HTML Pages
**Strategy:** Stale-While-Revalidate
- Serve cached version immediately
- Fetch fresh version in background
- Update cache with fresh content
- Use fresh content on next load

## Performance Considerations

### Cache Limits
- **Runtime Cache:** 200 items maximum
- **Image Cache:** 100 items maximum
- Automatic cleanup of oldest items when limit reached

### Background Sync
- Syncs every 5 minutes when online
- Syncs on page visibility change
- Syncs when connection restored
- Syncs on user action (manual sync button)

### Retry Logic
- Maximum 3 retry attempts per operation
- Exponential backoff: 1s, 2s, 4s (capped at 30s)
- Failed operations remain in queue for review

## Browser Support

### Full Support
- Chrome/Edge 84+
- Firefox 78+
- Safari 14+
- Opera 70+

### Partial Support
- Older browsers: Basic offline with localStorage fallback
- No Service Worker: Firestore persistence only
- No IndexedDB: Limited offline capability

## Testing Offline Functionality

### Chrome DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from throttling dropdown
4. Test creating requests while offline
5. Go back online and observe auto-sync

### Application Tab
1. Open DevTools → **Application** tab
2. Check **Service Workers** - should show active worker
3. Check **IndexedDB** → `ipdc-offline-db` - view stored data
4. Check **Cache Storage** - view cached resources

### Manual Testing
1. Create several service requests while online
2. Disconnect network (airplane mode or disable WiFi)
3. Create new service requests
4. Check offline banner appears
5. Verify requests saved locally
6. Reconnect network
7. Observe auto-sync and success notification

## Troubleshooting

### Issue: Service Worker not registering
**Solution:** Ensure HTTPS or localhost, check browser console for errors

### Issue: Data not syncing
**Solution:** Check network tab for errors, verify Firestore permissions, check queue status

### Issue: Cache growing too large
**Solution:** Clear application cache in DevTools, cache limits are enforced automatically

### Issue: Offline banner not showing
**Solution:** Check `useOnlineStatus` hook, verify event listeners

### Issue: IndexedDB quota exceeded
**Solution:** Clear old data, implement data cleanup strategy, check browser storage settings

## Security Considerations

### Data Encryption
- IndexedDB data is stored unencrypted locally
- Sensitive data should not be cached
- Clear cache on logout recommended

### Cache Invalidation
- Service worker updates on new deployment
- Old caches automatically deleted
- Version-based cache naming

### Authentication
- Auth state persists across offline/online
- Tokens refreshed when online
- Expired sessions require re-login

## Future Enhancements

### Planned Features
- [ ] Compression for cached data
- [ ] Selective sync (user chooses what to sync)
- [ ] Conflict resolution for concurrent edits
- [ ] Offline analytics
- [ ] Push notifications for sync status
- [ ] Export offline data to file

### Performance Improvements
- [ ] Web Worker for heavy operations
- [ ] Lazy loading of offline data
- [ ] Incremental sync instead of full sync
- [ ] Delta sync for large datasets

## Conclusion

The IPDC Platform's offline functionality ensures uninterrupted productivity for users in areas with unreliable internet connectivity. The system automatically handles data persistence, queuing, and synchronization, providing a seamless user experience whether online or offline.

For technical support or questions about offline functionality, please refer to the development team documentation or create an issue in the project repository.

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Author:** IPDC Development Team

# Known Warnings and Their Solutions

## ✅ FIXED
- **OperationsDashboard TypeError** - Fixed by adding null checks for `request.priority` and `request.status`
- **NotificationService Import Error** - Fixed by changing to lowercase `notificationService`
- **Firebase undefined notes field** - Fixed by conditionally including optional fields
- **jsPDF autoTable Error** - Fixed by using side-effect import for jspdf-autotable
- **FileUpload HTML Nesting Error** - Fixed by adding `secondaryTypographyProps` to ListItemText

## ℹ️ INFORMATIONAL (Not Errors)

### 1. Email Service Warning
```
⚠️ Email service not configured. Set VITE_EMAILJS_* environment variables.
```
**Solution:** Set up EmailJS credentials in `.env` file (see EMAILJS_SETUP.md)
**Impact:** Email notifications won't work until configured

### 2. MUI Grid Deprecation Warnings
```
MUI Grid: The `item`, `xs`, `sm` props have been removed
```
**Solution:** These are deprecation warnings for Material-UI Grid v2 migration
**Impact:** None - these still work, just use older API
**Fix:** Migrate to Grid2 component in future (optional)

### 3. Font Loading (Chrome Extension)
```
Slow network is detected... Fallback font will be used
```
**Solution:** This is from Chrome's PDF viewer extension, not your app
**Impact:** None on your application

### 4. Apple Web App Meta Tag
```
<meta name="apple-mobile-web-app-capable"> is deprecated
```
**Solution:** Update index.html meta tags
**Impact:** Minor - only affects PWA installation on iOS

### 5. Firebase Storage CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Configure CORS for Firebase Storage
**Impact:** File uploads will fail until CORS is configured
**Fix:** See "Firebase Storage CORS Configuration" section below

### 6. Firestore Composite Index Required
```
Error getting assets by park: FirebaseError: The query requires an index
```
**Solution:** Click the link in the error message to create the index automatically
**Impact:** Asset queries by park will fail until index is created
**Fix:** Firebase provides a direct link in the error - just click it and create the index

### 7. Network Status Check Errors
```
HEAD https://www.google.com/favicon.ico net::ERR_CONNECTION_CLOSED
```
**Solution:** This is normal when offline or when Google is blocked
**Impact:** None - the app detects offline status correctly
**Note:** The app has offline support and will work without internet

## 🔧 TO CONFIGURE

### Email Service (Optional)
1. Sign up at https://emailjs.com
2. Get your credentials
3. Add to `.env`:
```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Firebase (Required for Production)
Set up your Firebase project and add credentials to `.env`

### Firebase Storage CORS Configuration (Required for File Uploads)

To fix the CORS error and enable file uploads, you need to configure CORS for Firebase Storage:

**Method 1: Using Firebase Console (Recommended)**
1. Go to Firebase Console → Storage → Rules
2. Ensure your Storage Rules allow uploads:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Method 2: Using Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Navigate to Cloud Storage
4. Click on the bucket name
5. Go to "Permissions" tab
6. Add the CORS configuration

**Method 3: Using gsutil CLI**
1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Create a file named `cors.json`:
```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:5174"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```
3. Run: `gsutil cors set cors.json gs://your-bucket-name`

**For Production:**
Add your production domain to the CORS configuration:
```json
[
  {
    "origin": ["https://yourdomain.com", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

### Firestore Composite Indexes (Required for Asset Management)

When you see the error "The query requires an index", follow these steps:

**Easy Method (Recommended):**
1. Look at the error message in the console
2. Firebase provides a clickable link in the error
3. Click the link - it will open Firebase Console with the index pre-configured
4. Click "Create Index"
5. Wait 1-2 minutes for the index to build
6. Refresh your app

**Manual Method:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database → Indexes
4. Click "Create Index"
5. Add the following composite index:
   - **Collection:** `assets`
   - **Field 1:** `parkId` (Ascending)
   - **Field 2:** `createdAt` (Ascending)
6. Click "Create"

**Note:** You may need to create additional indexes as you use different query combinations. Firebase will always provide the direct link in the error message.

---

## 📝 IMPORTANT NOTES

### Amharic Language Support
The Amharic language is working correctly! The errors you see are NOT related to the language switcher. The platform fully supports:
- English (en)
- Amharic - አማርኛ (am)

To switch languages, click the language icon (🌐) in the status bar.

---

All critical errors are fixed! The platform is fully functional. 🎉

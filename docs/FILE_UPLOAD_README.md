# File Upload Feature - Setup Guide

## Overview
The IPDC Digital Platform includes a critical file upload feature that allows tenants to attach photos and documents to their service requests. This feature requires proper Firebase Storage configuration.

## Current Status
✅ **File upload UI is ready** - Tenants can select files
✅ **File validation is working** - Accepts images, PDFs, DOC, DOCX
✅ **Security rules created** - See `storage.rules`
❌ **CORS not configured** - This causes upload errors

## The CORS Error You're Seeing

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

This error occurs because Firebase Storage bucket doesn't allow cross-origin requests from your localhost development server.

## Quick Fix (5 minutes)

### For Windows Users:

1. **Install Google Cloud SDK** (if not already installed)
   - Download: https://cloud.google.com/sdk/docs/install
   - Run the installer
   - Restart your terminal

2. **Run the setup script**
   ```cmd
   setup-firebase-storage.bat
   ```

3. **Restart your development server**
   ```cmd
   npm run dev
   ```

4. **Test file upload**
   - Go to Facility Management request form
   - Try uploading a photo
   - Should work now! ✅

### For Linux/Mac Users:

1. **Install Google Cloud SDK**
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Apply CORS configuration**
   ```bash
   # Authenticate
   gcloud auth login

   # Set project (replace with your project ID)
   gcloud config set project ipdc-digital-platform

   # Apply CORS
   gcloud storage buckets update gs://YOUR-BUCKET-NAME.firebasestorage.app --cors-file=cors.json
   ```

3. **Restart dev server**
   ```bash
   npm run dev
   ```

## Detailed Setup Instructions

See the comprehensive guide: **[FIREBASE_STORAGE_CORS_SETUP.md](./FIREBASE_STORAGE_CORS_SETUP.md)**

This guide includes:
- Step-by-step instructions
- Troubleshooting tips
- Alternative setup methods
- Production deployment guide

## How File Upload Works

### User Flow:
1. **Tenant creates a service request**
2. **Clicks "Upload Files"** button
3. **Selects photos/documents** from their device
4. **Files are uploaded to Firebase Storage** during form submission
5. **Download URLs are saved** with the service request
6. **Admin/Operations can view** the attachments

### File Storage Structure:
```
Firebase Storage
└── service-requests/
    └── {userId}/
        ├── 1234567890-photo1.jpg
        ├── 1234567891-document.pdf
        └── 1234567892-report.docx
```

### Security:
- ✅ Only authenticated users can upload
- ✅ Users can only upload to their own folder
- ✅ Files are scoped by user ID for privacy
- ✅ All authenticated users can read files (for admin/operations viewing)

## Files Created for File Upload Feature

| File | Purpose |
|------|---------|
| `storage.rules` | Firebase Storage security rules |
| `cors.json` | CORS configuration for storage bucket |
| `setup-firebase-storage.bat` | Windows setup script |
| `FIREBASE_STORAGE_CORS_SETUP.md` | Comprehensive setup guide |
| `FILE_UPLOAD_README.md` | This file - quick reference |

## Testing File Upload

Once CORS is configured:

1. **Login as a tenant**
2. **Navigate to:** Services → Facility Management
3. **Fill in the form:**
   - Service Type: Maintenance
   - Title: "Test Upload"
   - Description: "Testing file upload feature"
   - Location: "Building A"
4. **Click "Upload Files"** button
5. **Select 1-2 images or PDFs**
6. **Submit the request**
7. **Check console** - Should see:
   ```
   📎 Uploading 2 file(s)...
   ✅ Uploaded: photo.jpg
   ✅ Uploaded: document.pdf
   ✅ Request created successfully
   ```

## Troubleshooting

### Still getting CORS errors?
- **Check:** Did you restart the dev server after CORS setup?
- **Check:** Did the `gcloud` command succeed without errors?
- **Try:** Clear browser cache (Ctrl+Shift+Delete)
- **Try:** Hard reload (Ctrl+Shift+R)
- **Wait:** CORS changes can take 1-2 minutes to propagate

### "gcloud: command not found"
- Google Cloud SDK is not installed
- Install from: https://cloud.google.com/sdk/docs/install
- Restart terminal after installation

### "Permission denied"
- Wrong Google account logged in
- Run: `gcloud auth login`
- Use account that has access to Firebase project

### Files not showing in Firebase Console
- Files ARE uploaded but CORS is blocking download
- Fix CORS, then files will be accessible
- Check: Firebase Console → Storage → Files

## Production Deployment

Before going to production:

1. **Update cors.json** with production domain:
```json
{
  "origin": ["https://your-production-domain.com"],
  ...
}
```

2. **Re-apply CORS:**
```bash
gcloud storage buckets update gs://YOUR-BUCKET.firebasestorage.app --cors-file=cors.json
```

3. **Deploy storage rules:**
```bash
firebase deploy --only storage
```

## Need Help?

- **Detailed Guide:** See `FIREBASE_STORAGE_CORS_SETUP.md`
- **Firebase Docs:** https://firebase.google.com/docs/storage/web/upload-files
- **Google Cloud SDK:** https://cloud.google.com/sdk/docs
- **CORS Info:** https://cloud.google.com/storage/docs/using-cors

## Summary

**To fix file uploads:**
1. ✅ Run `setup-firebase-storage.bat` (Windows)
2. ✅ Follow prompts to authenticate and configure
3. ✅ Restart dev server
4. ✅ Test upload - should work!

**This is a one-time setup** - once done, file uploads work permanently! 🎉

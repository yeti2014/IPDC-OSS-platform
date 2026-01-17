# Firebase Storage CORS Configuration Guide

## Problem
The CORS (Cross-Origin Resource Sharing) error occurs when the browser blocks file uploads to Firebase Storage because the storage bucket doesn't have proper CORS configuration.

**Error Message:**
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution: Configure CORS for Firebase Storage

### Option 1: Using Firebase CLI (Recommended)

#### Step 1: Install Google Cloud SDK
1. Download and install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install
2. After installation, restart your terminal/command prompt

#### Step 2: Authenticate with Google Cloud
```bash
gcloud auth login
```
This will open a browser window for you to sign in with your Google account.

#### Step 3: Set Your Project
```bash
gcloud config set project ipdc-digital-platform
```
Replace `ipdc-digital-platform` with your actual Firebase project ID.

#### Step 4: Create CORS Configuration File
Create a file named `cors.json` in your project root with the following content:

```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "https://your-production-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
```

**Important:** Replace `https://your-production-domain.com` with your actual production domain.

#### Step 5: Apply CORS Configuration
```bash
gcloud storage buckets update gs://ipdc-digital-platform.firebasestorage.app --cors-file=cors.json
```

Replace `ipdc-digital-platform.firebasestorage.app` with your actual storage bucket name.

You can find your bucket name in:
- Firebase Console → Storage → Files tab (look at the URL)
- OR in your `.env` file: `VITE_FIREBASE_STORAGE_BUCKET`

#### Step 6: Verify CORS Configuration
```bash
gcloud storage buckets describe gs://ipdc-digital-platform.firebasestorage.app --format="default(cors_config)"
```

---

### Option 2: Using gsutil (Alternative)

If you prefer using gsutil (older Google Cloud SDK tool):

#### Step 1: Install gsutil
Follow instructions at: https://cloud.google.com/storage/docs/gsutil_install

#### Step 2: Create cors.json (same as above)

#### Step 3: Apply CORS Configuration
```bash
gsutil cors set cors.json gs://ipdc-digital-platform.firebasestorage.app
```

#### Step 4: Verify Configuration
```bash
gsutil cors get gs://ipdc-digital-platform.firebasestorage.app
```

---

### Option 3: Firebase Console (Manual - Limited)

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **IPDC Digital Platform**
3. Go to **Storage** in the left menu
4. Click on **Rules** tab
5. Deploy the `storage.rules` file content (see storage.rules in project root)

**Note:** This configures security rules but NOT CORS. You still need Option 1 or 2 for CORS.

---

## Quick Setup Script (Windows PowerShell)

Create a file named `setup-cors.ps1`:

```powershell
# CORS Setup Script for Firebase Storage

Write-Host "🔧 Firebase Storage CORS Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Get project ID from .env file
$envFile = Get-Content .env
$projectId = ($envFile | Select-String "VITE_FIREBASE_STORAGE_BUCKET=(.+)").Matches.Groups[1].Value
$projectId = $projectId -replace ".firebasestorage.app", ""

Write-Host "📦 Project ID: $projectId" -ForegroundColor Green
Write-Host "🪣 Storage Bucket: $projectId.firebasestorage.app`n" -ForegroundColor Green

# Create cors.json
$corsConfig = @"
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "https://your-production-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
"@

$corsConfig | Out-File -FilePath "cors.json" -Encoding UTF8
Write-Host "✅ Created cors.json configuration file`n" -ForegroundColor Green

Write-Host "🔐 Authenticating with Google Cloud..." -ForegroundColor Yellow
gcloud auth login

Write-Host "`n⚙️ Setting project..." -ForegroundColor Yellow
gcloud config set project $projectId

Write-Host "`n📤 Applying CORS configuration..." -ForegroundColor Yellow
gcloud storage buckets update gs://$projectId.firebasestorage.app --cors-file=cors.json

Write-Host "`n✅ CORS configuration applied successfully!" -ForegroundColor Green
Write-Host "`n📋 Verifying configuration..." -ForegroundColor Yellow
gcloud storage buckets describe gs://$projectId.firebasestorage.app --format="default(cors_config)"

Write-Host "`n✅ Setup complete! You can now upload files." -ForegroundColor Green
Write-Host "🔄 Please restart your development server for changes to take effect.`n" -ForegroundColor Cyan
```

Run with:
```powershell
.\setup-cors.ps1
```

---

## Quick Setup Script (Linux/Mac Bash)

Create a file named `setup-cors.sh`:

```bash
#!/bin/bash

echo "🔧 Firebase Storage CORS Setup"
echo "================================"
echo ""

# Get project ID from .env file
PROJECT_ID=$(grep VITE_FIREBASE_STORAGE_BUCKET ipdc-platform/.env | cut -d '=' -f2 | sed 's/.firebasestorage.app//')

echo "📦 Project ID: $PROJECT_ID"
echo "🪣 Storage Bucket: $PROJECT_ID.firebasestorage.app"
echo ""

# Create cors.json
cat > cors.json <<EOF
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "https://your-production-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
EOF

echo "✅ Created cors.json configuration file"
echo ""

echo "🔐 Authenticating with Google Cloud..."
gcloud auth login

echo ""
echo "⚙️ Setting project..."
gcloud config set project $PROJECT_ID

echo ""
echo "📤 Applying CORS configuration..."
gcloud storage buckets update gs://$PROJECT_ID.firebasestorage.app --cors-file=cors.json

echo ""
echo "✅ CORS configuration applied successfully!"
echo ""
echo "📋 Verifying configuration..."
gcloud storage buckets describe gs://$PROJECT_ID.firebasestorage.app --format="default(cors_config)"

echo ""
echo "✅ Setup complete! You can now upload files."
echo "🔄 Please restart your development server for changes to take effect."
echo ""
```

Run with:
```bash
chmod +x setup-cors.sh
./setup-cors.sh
```

---

## Troubleshooting

### Issue: "gcloud: command not found"
**Solution:** Install Google Cloud SDK first (see Step 1 above)

### Issue: "Permission denied"
**Solution:** Make sure you're logged in with the correct Google account that has access to the Firebase project
```bash
gcloud auth login
```

### Issue: CORS still not working after configuration
**Solutions:**
1. Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart your development server
3. Wait 1-2 minutes for CORS changes to propagate
4. Check if you used the correct bucket name

### Issue: "Bucket not found"
**Solution:** Verify your bucket name in Firebase Console → Storage, or in your .env file

---

## After Configuration

Once CORS is configured:

1. ✅ File uploads will work from localhost and your production domain
2. ✅ No more CORS errors in the browser console
3. ✅ Files will be uploaded to: `service-requests/{userId}/{fileName}`
4. ✅ Security rules ensure only authenticated users can upload to their own folders

---

## Production Deployment

Before deploying to production:

1. Update `cors.json` to include your production domain:
```json
{
  "origin": ["https://your-production-domain.com"],
  ...
}
```

2. Re-apply CORS configuration:
```bash
gcloud storage buckets update gs://ipdc-digital-platform.firebasestorage.app --cors-file=cors.json
```

---

## Need Help?

- **Firebase Documentation:** https://firebase.google.com/docs/storage/web/upload-files
- **CORS Documentation:** https://cloud.google.com/storage/docs/using-cors
- **Google Cloud SDK:** https://cloud.google.com/sdk/docs

---

## Summary

**The CORS error will be fixed once you:**
1. Install Google Cloud SDK
2. Run the setup script OR manually apply CORS configuration
3. Restart your development server

**This is a one-time setup** - once configured, file uploads will work permanently for your project.

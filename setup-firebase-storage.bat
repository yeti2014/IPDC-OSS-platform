@echo off
echo.
echo ============================================
echo Firebase Storage CORS Setup for IPDC Platform
echo ============================================
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Google Cloud SDK is not installed!
    echo.
    echo Please install it from:
    echo https://cloud.google.com/sdk/docs/install
    echo.
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo Step 1: Authenticating with Google Cloud...
echo.
gcloud auth login

echo.
echo Step 2: Getting project ID from .env file...
set PROJECT_ID=
for /f "tokens=2 delims==" %%a in ('findstr "VITE_FIREBASE_STORAGE_BUCKET" ipdc-platform\.env') do set BUCKET=%%a
for /f "tokens=1 delims=." %%a in ("%BUCKET%") do set PROJECT_ID=%%a

echo Project ID: %PROJECT_ID%
echo Storage Bucket: %BUCKET%
echo.

echo Step 3: Setting project...
gcloud config set project %PROJECT_ID%

echo.
echo Step 4: Applying CORS configuration...
echo.
gcloud storage buckets update gs://%BUCKET% --cors-file=cors.json

echo.
echo Step 5: Deploying Storage Security Rules...
echo.
firebase deploy --only storage --project %PROJECT_ID%

echo.
echo ============================================
echo SUCCESS! CORS configuration applied.
echo ============================================
echo.
echo File uploads should now work!
echo Please restart your development server.
echo.
pause

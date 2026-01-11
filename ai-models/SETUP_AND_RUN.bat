@echo off
echo ================================================================
echo   IPDC Platform AI Models - Automated Setup and Training
echo   Adapted from Chinese Smart Park Systems
echo ================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [Step 1/5] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [Step 2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [Step 3/5] Upgrading pip...
python -m pip install --upgrade pip

echo [Step 4/5] Installing dependencies (this may take a few minutes)...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================================================
echo   Setup Complete! Now you can:
echo ================================================================
echo.
echo   1. Add Firebase service account key to: .env\firebase-service-account.json
echo   2. Run data export: python data\export_data.py
echo   3. Train Model 1: python model1_service_classifier\train.py
echo   4. Train Model 2: python model2_predictive_maintenance\train.py
echo   5. Start API server: uvicorn api.main:app --reload
echo.
echo   See QUICK_START.md for detailed instructions
echo.
echo ================================================================
pause

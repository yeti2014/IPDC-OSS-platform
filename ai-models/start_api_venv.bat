@echo off
REM IPDC-OSS FastAPI Backend Startup Script (with Virtual Environment)
REM Ethiopian Industrial Parks Development Corporation

echo.
echo ============================================================
echo   IPDC-OSS API Server (Virtual Environment)
echo   Ethiopian Industrial Parks Development Corporation
echo   One-Stop Service Platform
echo ============================================================
echo.

REM Navigate to ai-models directory
cd /d "%~dp0"

echo [1/3] Activating Python virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo [2/4] Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not available in virtual environment
    pause
    exit /b 1
)

echo.
echo [3/4] Installing FastAPI dependencies...
pip install -q -r requirements_api.txt
if errorlevel 1 (
    echo WARNING: Some dependencies may have failed to install
)

echo.
echo [4/4] Starting FastAPI server...
echo.
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/api/docs
echo.

REM Start the FastAPI server
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

pause

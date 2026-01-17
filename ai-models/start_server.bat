@echo off
REM IPDC-OSS FastAPI Server Startup (Simplified)

echo.
echo ============================================================
echo   IPDC-OSS API Server
echo   Ethiopian Industrial Parks Development Corporation
echo ============================================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting server at http://localhost:8000
echo API Documentation: http://localhost:8000/api/docs
echo.
echo Press CTRL+C to stop the server
echo.

python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

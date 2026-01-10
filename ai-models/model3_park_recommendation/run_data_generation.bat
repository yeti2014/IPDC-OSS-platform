@echo off
echo ================================================================
echo   Model 3: Generating Synthetic Tenant-Park Placement Data
echo ================================================================
echo.

REM Navigate to ai-models directory
cd /d "%~dp0\.."

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run data generation
python model3_park_recommendation\generate_synthetic_placements.py

echo.
echo ================================================================
pause

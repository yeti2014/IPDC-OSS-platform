@echo off
echo ================================================================
echo   Model 3: Park Recommendation System - Complete Training
echo   Adapted from Alibaba ET + Tencent WeCity
echo ================================================================
echo.

REM Navigate to ai-models directory
cd /d "%~dp0\.."

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo.
    echo ERROR: Virtual environment not found!
    echo.
    echo Please run SETUP_PYTHON_ENV.bat first to create the environment.
    echo.
    pause
    exit /b 1
)

echo [Step 1/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [Step 2/4] Installing LightGBM (if needed)...
pip install lightgbm==4.1.0 --quiet

echo.
echo [Step 3/4] Generating synthetic tenant-park placement data...
python model3_park_recommendation\generate_synthetic_placements.py

if errorlevel 1 (
    echo.
    echo ERROR: Data generation failed!
    pause
    exit /b 1
)

echo.
echo [Step 4/4] Training Model 3 with LightGBM Ranker...
python model3_park_recommendation\train.py

if errorlevel 1 (
    echo.
    echo ERROR: Model training failed!
    pause
    exit /b 1
)

echo.
echo ================================================================
echo   SUCCESS! Model 3 training complete!
echo ================================================================
echo.
echo   Next steps:
echo   1. Test model: python model3_park_recommendation\test_model.py
echo   2. View results: model3_park_recommendation\models\
echo   3. Check metadata: model3_park_recommendation\models\metadata.json
echo.
echo ================================================================
pause

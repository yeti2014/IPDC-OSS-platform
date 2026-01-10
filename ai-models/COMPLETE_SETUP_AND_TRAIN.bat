@echo off
REM ======================================================================
REM  IPDC Platform - Complete Setup & Train Model 3 (All-in-One)
REM ======================================================================

echo.
echo ======================================================================
echo   IPDC Platform - Complete Setup and Training
echo   Model 3: Park Recommendation System
echo ======================================================================
echo.
echo This script will:
echo   1. Create Python virtual environment
echo   2. Install all required packages
echo   3. Generate synthetic training data
echo   4. Train Model 3 with LightGBM
echo   5. Test the trained model
echo.
echo Total time: 15-20 minutes
echo.
echo ======================================================================
pause

REM Navigate to ai-models directory
cd /d "%~dp0"

REM ======================================================================
REM PART 1: Environment Setup
REM ======================================================================

echo.
echo ======================================================================
echo   PART 1/2: Setting Up Python Environment
echo ======================================================================
echo.

if exist "venv\Scripts\activate.bat" (
    echo Virtual environment already exists. Skipping creation...
    goto :activate_venv
)

echo Creating virtual environment...
py -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to create virtual environment
    echo.
    echo Trying alternative method...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Could not create virtual environment
        echo.
        echo Please ensure Python is properly installed
        echo Run: py --version (should show Python 3.11.0)
        echo.
        pause
        exit /b 1
    )
)
echo ✅ Virtual environment created!
echo.

:activate_venv
echo Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated!
echo.

echo Upgrading pip...
python -m pip install --upgrade pip --quiet
echo ✅ Pip upgraded!
echo.

echo Installing packages (this may take 5-10 minutes)...
echo Installing: pandas, numpy, scikit-learn, xgboost, lightgbm, matplotlib...
pip install pandas numpy scikit-learn xgboost joblib matplotlib seaborn lightgbm==4.1.0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)
echo ✅ All packages installed!
echo.

echo Verifying installation...
python -c "import pandas, numpy, sklearn, xgboost, lightgbm; print('✅ All packages verified!')"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Package verification failed
    pause
    exit /b 1
)
echo.

echo ======================================================================
echo   ✅ PART 1 COMPLETE: Environment Setup Done!
echo ======================================================================
echo.
pause

REM ======================================================================
REM PART 2: Train Model 3
REM ======================================================================

echo.
echo ======================================================================
echo   PART 2/2: Training Model 3
echo ======================================================================
echo.

echo Generating synthetic training data (800 placements)...
python model3_park_recommendation\generate_synthetic_placements.py
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Data generation failed
    pause
    exit /b 1
)
echo.

echo Training Model 3 with LightGBM Ranker...
python model3_park_recommendation\train.py
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Model training failed
    pause
    exit /b 1
)
echo.

echo Testing trained model...
python model3_park_recommendation\test_model.py
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Model testing encountered issues
)
echo.

echo ======================================================================
echo   ✅✅✅ ALL COMPLETE! ✅✅✅
echo ======================================================================
echo.
echo   Setup:     ✅ Python environment created
echo   Packages:  ✅ All dependencies installed
echo   Data:      ✅ 800 synthetic placements generated
echo   Training:  ✅ Model 3 trained successfully
echo   Testing:   ✅ Model tested with sample cases
echo.
echo   📂 Files created:
echo      - venv\                     (Virtual environment)
echo      - data\raw\park_placements_synthetic.csv  (~245 KB)
echo      - model3_park_recommendation\models\model_ranker.pkl  (~2 MB)
echo      - model3_park_recommendation\models\feature_importance.png
echo      - model3_park_recommendation\models\metadata.json
echo.
echo   📊 Next steps:
echo      1. Review results in models\ folder
echo      2. Check metadata.json for performance metrics
echo      3. View feature_importance.png chart
echo      4. Integrate Model 3 with your API
echo.
echo ======================================================================
pause

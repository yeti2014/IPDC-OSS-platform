@echo off
REM ======================================================================
REM  IPDC Platform - Python Environment Setup for Model 3
REM ======================================================================
echo.
echo ======================================================================
echo   Setting up Python Environment for Model 3 Training
echo ======================================================================
echo.

REM Navigate to ai-models directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Step 1: Create virtual environment
echo Step 1/5: Creating Python virtual environment...
py -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create virtual environment with 'py' command
    echo Trying with python command...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Could not create virtual environment
        echo Please install Python from python.org
        pause
        exit /b 1
    )
)
echo ✅ Virtual environment created successfully!
echo.

REM Step 2: Activate virtual environment
echo Step 2/5: Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated!
echo.

REM Step 3: Upgrade pip
echo Step 3/5: Upgrading pip...
python -m pip install --upgrade pip
echo ✅ Pip upgraded!
echo.

REM Step 4: Install required packages
echo Step 4/5: Installing required packages...
echo This may take 5-10 minutes...
echo.
pip install pandas numpy scikit-learn xgboost joblib matplotlib seaborn lightgbm==4.1.0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)
echo ✅ All packages installed successfully!
echo.

REM Step 5: Verify installation
echo Step 5/5: Verifying installation...
python -c "import pandas, numpy, sklearn, xgboost, lightgbm; print('✅ All packages imported successfully!')"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Package verification failed
    pause
    exit /b 1
)
echo.

echo ======================================================================
echo   ✅ PYTHON ENVIRONMENT SETUP COMPLETE!
echo ======================================================================
echo.
echo Virtual environment created at: %CD%\venv
echo.
echo Next steps:
echo   1. Run TRAIN_MODEL3.bat to train Model 3
echo   2. Or manually activate venv: venv\Scripts\activate.bat
echo.
echo ======================================================================
pause

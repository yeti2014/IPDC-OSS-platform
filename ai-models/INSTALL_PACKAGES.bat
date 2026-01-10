@echo off
REM ======================================================================
REM  IPDC Platform - Install Python Packages for Model 3
REM ======================================================================

cd /d "%~dp0"

echo.
echo ======================================================================
echo   Installing Python Packages for Model 3
echo ======================================================================
echo.

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run SETUP_PYTHON_ENV.bat first
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Installing required packages...
echo This will take 5-10 minutes...
echo.

echo [1/8] Installing pandas...
pip install pandas

echo [2/8] Installing numpy...
pip install numpy

echo [3/8] Installing scikit-learn...
pip install scikit-learn

echo [4/8] Installing xgboost...
pip install xgboost

echo [5/8] Installing joblib...
pip install joblib

echo [6/8] Installing matplotlib...
pip install matplotlib

echo [7/8] Installing seaborn...
pip install seaborn

echo [8/8] Installing lightgbm...
pip install lightgbm==4.1.0

echo.
echo ======================================================================
echo   ✅ ALL PACKAGES INSTALLED!
echo ======================================================================
echo.

echo Verifying installation...
python -c "import pandas, numpy, sklearn, xgboost, lightgbm, matplotlib; print('✅ All packages verified!')"

echo.
echo You can now run: TRAIN_MODEL3.bat
echo.
pause

@echo off
REM Fix XGBoost installation for Windows

echo.
echo ============================================================
echo   Fixing XGBoost Installation
echo ============================================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Uninstalling current XGBoost...
pip uninstall -y xgboost

echo.
echo Reinstalling XGBoost with proper Windows support...
pip install xgboost --force-reinstall --no-cache-dir

echo.
echo ============================================================
echo   XGBoost Fix Complete!
echo ============================================================
echo.

pause

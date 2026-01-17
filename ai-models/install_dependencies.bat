@echo off
REM Install FastAPI Dependencies

echo.
echo ============================================================
echo   Installing IPDC-OSS API Dependencies
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [2/2] Installing packages...
echo.

pip install fastapi
pip install "uvicorn[standard]"
pip install pydantic
pip install python-multipart
pip install pandas
pip install numpy
pip install scikit-learn
pip install xgboost
pip install joblib
pip install python-dateutil

echo.
echo ============================================================
echo   Installation Complete!
echo ============================================================
echo.

pause

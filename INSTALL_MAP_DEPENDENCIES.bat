@echo off
echo ================================================================
echo   Installing Interactive Map Dependencies
echo   React-Leaflet + Leaflet for Ethiopian IPDC Parks Map
echo ================================================================
echo.

REM Navigate to project root
cd /d "%~dp0"

echo [1/3] Installing Leaflet (mapping library)...
call npm install leaflet

echo.
echo [2/3] Installing React-Leaflet (React wrapper)...
call npm install react-leaflet

echo.
echo [3/3] Installing TypeScript types for Leaflet...
call npm install --save-dev @types/leaflet

echo.
echo ================================================================
echo   ✅ Installation Complete!
echo ================================================================
echo.
echo Next steps:
echo   1. Verify package.json was updated
echo   2. Run: npm run dev
echo   3. Start building the map components
echo.
pause

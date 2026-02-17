@echo off
echo =============================
echo NotePro Build Script (Windows)
echo =============================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo Dependencies installed
    echo.
)

REM Check if electron-builder is installed
npm list electron-builder --depth=0 >nul 2>&1
if errorlevel 1 (
    echo Installing electron-builder...
    call npm install --save-dev electron-builder
    echo electron-builder installed
    echo.
)

echo Building NotePro for Windows...
echo.
call npm run build:win

echo.
echo =============================
echo Build Complete!
echo =============================
echo.
echo Check the 'dist' folder for your app:
echo - NotePro Setup.exe (Installer)
echo - NotePro-Portable.exe (No install needed)
echo.
dir dist /b
echo.
pause
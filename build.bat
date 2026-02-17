@echo off
title NoteX Build Script
color 0A

echo ============================
echo      NoteX Build Started
echo ============================
echo.

REM ---- Clean old dist ----
echo Cleaning old build...
if exist dist rmdir /s /q dist

REM ---- Clean electron-builder cache (optional but stable) ----
echo Cleaning electron cache...
if exist "%LOCALAPPDATA%\electron-builder" rmdir /s /q "%LOCALAPPDATA%\electron-builder"

echo.

REM ---- Install dependencies ----
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ npm install failed
    pause
    exit /b
)

echo.

REM ---- Build MSI ----
echo Building MSI Installer...
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx electron-builder --win msi

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed
    pause
    exit /b
)

echo.
echo ============================
echo   ✅ BUILD COMPLETED SUCCESSFULLY
echo ============================

echo.
echo Output folder: dist
echo.

pause

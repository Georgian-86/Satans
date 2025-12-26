@echo off
echo ============================================
echo   SatAns Website - Quick Setup Script
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

:: Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL command not found in PATH
    echo Make sure PostgreSQL is installed and added to PATH
    echo.
)

:: Install dependencies
echo.
echo Step 1: Installing Node.js dependencies...
echo ============================================
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

:: Check if .env exists
if not exist .env (
    echo Step 2: Creating .env file...
    echo ============================================
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] .env file created from .env.example
        echo.
        echo [IMPORTANT] Please edit .env file with your actual credentials:
        echo   - Database password
        echo   - JWT secret
        echo   - Razorpay keys
        echo   - Email credentials
        echo   - Admin password
        echo.
    ) else (
        echo [ERROR] .env.example not found
    )
) else (
    echo [OK] .env file already exists
    echo.
)

:: Offer to create database
echo Step 3: Database Setup
echo ============================================
echo.
set /p setupdb="Do you want to set up the database now? (y/n): "
if /i "%setupdb%"=="y" (
    echo.
    echo Please run these commands in PostgreSQL:
    echo.
    echo   psql -U postgres
    echo   CREATE DATABASE satans_db;
    echo   \q
    echo   psql -U postgres -d satans_db -f database.sql
    echo.
    echo Press any key when done...
    pause >nul
)

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next Steps:
echo   1. Edit .env file with your credentials
echo   2. Set up PostgreSQL database (if not done)
echo   3. Run: npm start
echo   4. Open index.html in browser with Live Server
echo.
echo For detailed instructions, see: SETUP_GUIDE.md
echo.
pause

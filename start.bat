@echo off
title Shifra AI Assistant - Complete Setup
color 0A

echo.
echo ========================================
echo    SHIFRA AI ASSISTANT - STARTUP
echo ========================================
echo.

echo [1/4] Checking dependencies...
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)

if not exist client\node_modules (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

echo [2/4] Starting backend server...
start "Shifra Backend" cmd /k "echo Starting Shifra AI Backend... && node advanced-server.js"

echo [3/4] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend...
cd client
start "Shifra Frontend" cmd /k "echo Starting Shifra AI Frontend... && npm start"
cd ..

echo.
echo ========================================
echo    SHIFRA AI ASSISTANT STARTED!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close this window when you're done.
echo.
pause
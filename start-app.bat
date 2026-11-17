@echo off
title Campus Bikepool Launcher
echo ========================================================
echo           Starting Campus Bikepool Full-Stack
echo ========================================================
echo.

echo [1/2] Starting Backend API on http://localhost:5000...
start "Campus Bikepool - Backend" cmd /k "cd backend && npm start"

echo [2/2] Starting React Frontend on http://localhost:3000...
start "Campus Bikepool - Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers have been launched in separate terminal windows.
echo Opening browser at http://localhost:3000 in 4 seconds...
timeout /t 4 >nul
start http://localhost:3000

echo Done! Press any key to close this launcher window.
pause >nul

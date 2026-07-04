@echo off
title Space Weather Dashboard Launcher
color 0B

echo ===================================================================
echo   GEO ELECTRON FLUX PREDICTION DASHBOARD - LAUNCHER
echo ===================================================================
echo.
echo   [+] Launching FastAPI ML Backend on http://127.0.0.1:8000
echo   [+] Launching React Vite Frontend on http://localhost:5173
echo.
echo ===================================================================
echo.

:: Launch the FastAPI Backend in a separate cmd window
start "Space Weather API Backend" cmd /k "cd backend && python main.py"

:: Launch the Vite React Frontend dev server in a separate cmd window
start "Space Weather React UI" cmd /k "cd frontend && npm run dev"

:: Open default browser automatically
timeout /t 2 >nul
start http://localhost:5173

echo   [!] All services started! 
echo   [!] Opening http://localhost:5173 in your default browser...
echo.
echo ===================================================================
pause

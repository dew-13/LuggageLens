@echo off
REM Start BaggageLens locally (localhost)
REM This runs both frontend and backend on localhost

echo.
echo ========================================
echo  BaggageLens - LOCAL DEVELOPMENT
echo ========================================
echo.
echo Starting Backend (port 5000)...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak

echo.
echo Starting Frontend (port 3000)...
start cmd /k "cd web && npm start"

echo.
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to continue...
pause

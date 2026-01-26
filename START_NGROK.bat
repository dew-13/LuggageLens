@echo off
REM Start BaggageLens with ngrok
REM This exposes both frontend and backend through ngrok

echo.
echo ========================================
echo  BaggageLens - NGROK SETUP
echo ========================================
echo.
echo STEP 1: Starting Backend (port 5000)...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak

echo.
echo STEP 2: Starting Frontend (port 3000)...
start cmd /k "cd web && npm start"

timeout /t 3 /nobreak

echo.
echo STEP 3: Creating ngrok tunnels...
echo Creating tunnel for Backend (5000)...
start cmd /k "ngrok http 5000 --log=stdout"

timeout /t 3 /nobreak

echo.
echo Creating tunnel for Frontend (3000)...
start cmd /k "ngrok http 3000 --log=stdout"

echo.
echo ========================================
echo IMPORTANT NEXT STEPS:
echo ========================================
echo.
echo 1. Note the ngrok URLs from the ngrok windows
echo    Backend URL: https://xxxx-xxxx-xxxx.ngrok.io
echo    Frontend URL: https://yyyy-yyyy-yyyy.ngrok.io
echo.
echo 2. Update web\.env:
echo    Replace: REACT_APP_API_URL=https://xxxx-xxxx-xxxx.ngrok.io/api
echo    (Use the Backend ngrok URL)
echo.
echo 3. Update backend\.env:
echo    Already configured with CORS for ngrok ✓
echo.
echo 4. Access the app at the Frontend ngrok URL in your browser
echo.
echo ========================================
echo.
pause

@echo off
echo ============================================================
echo    Google Analytics Dashboard Launcher
echo ============================================================
echo.
echo Starting Flask API server...
cd mock_api
start "Google Analytics API" python app.py
echo.
echo Starting web server...
cd ..
start "Google Analytics Web" python -m http.server 8080
echo.
echo Waiting for servers to start...
timeout /t 4 /nobreak > nul
echo.
echo Opening dashboard in browser...
start "" "http://localhost:8080"
echo.
echo ============================================================
echo    Google Analytics Dashboard is ready!
echo ============================================================
echo.
echo Access URLs:
echo   - Dashboard: http://localhost:8080
echo   - API Server: http://localhost:5000
echo.
echo Instructions:
echo   - Dashboard should open automatically
echo   - Close both server windows to stop
echo.
pause
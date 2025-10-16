@echo off
REM Launch Chrome with Remote Debugging for MCP Integration

echo.
echo ================================================
echo   Launching Chrome with Remote Debugging
echo ================================================
echo.

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set DEBUG_PORT=9222
set APP_URL=http://localhost:5173

echo Starting Chrome...
echo   Port: %DEBUG_PORT%
echo   URL: %APP_URL%
echo.

start "" %CHROME_PATH% --remote-debugging-port=%DEBUG_PORT% --user-data-dir=%TEMP%\chrome-debug-profile %APP_URL%

echo.
echo Chrome launched successfully!
echo.
echo Next steps:
echo   1. Configure MCP in Cursor settings (see MCP_SETUP_GUIDE.md)
echo   2. Restart Cursor
echo   3. Ask the AI to test your Pomodoro app!
echo.
pause


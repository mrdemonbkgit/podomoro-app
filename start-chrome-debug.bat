@echo off
echo Starting Chrome with Remote Debugging...
echo This will use your default profile with all your logins!
echo.
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\Tony\AppData\Local\Google\Chrome\User Data" --profile-directory=Default
echo.
echo Chrome started with remote debugging on port 9222
echo You can now use Chrome DevTools MCP in Cursor
echo.
pause


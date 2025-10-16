# Launch Chrome with Remote Debugging for MCP Integration
# This script starts Chrome with remote debugging enabled on port 9222

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$debugPort = 9222
$appUrl = "http://localhost:5173"

Write-Host "🚀 Launching Chrome with remote debugging..." -ForegroundColor Cyan
Write-Host "   Port: $debugPort" -ForegroundColor Gray
Write-Host "   URL: $appUrl" -ForegroundColor Gray

# Check if Chrome is already running with debugging
$existingProcess = Get-Process chrome -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*remote-debugging-port=$debugPort*" }

if ($existingProcess) {
    Write-Host "⚠️  Chrome is already running with debugging on port $debugPort" -ForegroundColor Yellow
    Write-Host "   Opening new tab..." -ForegroundColor Gray
    Start-Process $chromePath -ArgumentList $appUrl
} else {
    # Launch Chrome with remote debugging
    Start-Process $chromePath -ArgumentList `
        "--remote-debugging-port=$debugPort", `
        "--user-data-dir=$env:TEMP\chrome-debug-profile", `
        $appUrl
    
    Write-Host "✅ Chrome launched successfully!" -ForegroundColor Green
    Write-Host "" 
    Write-Host "Chrome is now accessible for MCP integration." -ForegroundColor Green
    Write-Host "You can now ask the AI assistant to interact with your app!" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Configure MCP in Cursor settings (see MCP_SETUP_GUIDE.md)" -ForegroundColor Gray
Write-Host "   2. Restart Cursor" -ForegroundColor Gray
Write-Host "   3. Ask me to test your Pomodoro app!" -ForegroundColor Gray


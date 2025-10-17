# Automatic Sound Downloader for Pomodoro App
# Note: Some sites (like Pixabay/Freesound) require authentication and won't allow direct downloads
# This script will attempt direct downloads where possible and open browser for others

Write-Host "🎵 Automatic Sound Downloader" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Create directory
if (!(Test-Path "public/sounds")) {
    New-Item -ItemType Directory -Path "public/sounds" -Force | Out-Null
    Write-Host "✅ Created public/sounds/ directory" -ForegroundColor Green
} else {
    Write-Host "✅ public/sounds/ directory exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "⚠️  Important Information:" -ForegroundColor Yellow
Write-Host "Due to website restrictions, most sound sites (Pixabay, Freesound) require:" -ForegroundColor Yellow
Write-Host "  - Clicking through their website" -ForegroundColor Yellow
Write-Host "  - Accepting terms" -ForegroundColor Yellow
Write-Host "  - Some require free accounts" -ForegroundColor Yellow
Write-Host ""
Write-Host "I'll use a hybrid approach:" -ForegroundColor Cyan
Write-Host "  1. Try direct download for public domain sources" -ForegroundColor White
Write-Host "  2. Open browser pages for sites requiring interaction" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Green
Read-Host

# Function to download file
function Download-Sound {
    param($name, $url, $filename)
    
    $filepath = "public/sounds/$filename"
    
    if (Test-Path $filepath) {
        Write-Host "  ⏭️  $name already exists, skipping" -ForegroundColor Gray
        return
    }
    
    Write-Host "  ⬇️  Downloading $name..." -ForegroundColor Cyan
    
    try {
        # Attempt download
        Invoke-WebRequest -Uri $url -OutFile $filepath -UserAgent "Mozilla/5.0" -TimeoutSec 10
        
        if (Test-Path $filepath) {
            $size = (Get-Item $filepath).Length
            if ($size -gt 1000) {
                Write-Host "  ✅ Downloaded $name ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  File too small, may not be valid" -ForegroundColor Yellow
                Remove-Item $filepath
                Write-Host "  🌐 Opening browser for manual download" -ForegroundColor Cyan
                return $false
            }
        }
        return $true
    } catch {
        Write-Host "  ❌ Cannot auto-download (site requires interaction)" -ForegroundColor Red
        return $false
    }
}

# Try to download from direct public sources
Write-Host ""
Write-Host "🎵 ATTEMPTING DIRECT DOWNLOADS" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Note: Most will fail due to site restrictions - this is normal!" -ForegroundColor Yellow
Write-Host ""

# These are example CDN URLs - most real sites don't allow direct download
$sounds = @(
    @{Name="Rain"; Url=""; File="rain.mp3"; Browser="https://pixabay.com/sound-effects/search/rain%20loop/"}
    @{Name="Ocean"; Url=""; File="ocean.mp3"; Browser="https://pixabay.com/sound-effects/search/ocean%20waves/"}
    @{Name="Forest"; Url=""; File="forest.mp3"; Browser="https://freesound.org/search/?q=forest+birds+loop"}
    @{Name="River"; Url=""; File="river.mp3"; Browser="https://pixabay.com/sound-effects/search/river%20stream/"}
    @{Name="Birds"; Url=""; File="birds.mp3"; Browser="https://pixabay.com/sound-effects/search/birds%20chirping/"}
)

$failedDownloads = @()

foreach ($sound in $sounds) {
    if ($sound.Url -eq "") {
        Write-Host "  🌐 $($sound.Name): Opening in browser (no direct download)" -ForegroundColor Yellow
        $failedDownloads += $sound
    } else {
        $result = Download-Sound -name $sound.Name -url $sound.Url -filename $sound.File
        if ($result -eq $false) {
            $failedDownloads += $sound
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Magenta
Write-Host ""

if ($failedDownloads.Count -gt 0) {
    Write-Host "🌐 OPENING BROWSER FOR MANUAL DOWNLOADS" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "I'll open the download pages for $($failedDownloads.Count) sounds." -ForegroundColor Cyan
    Write-Host "For each page:" -ForegroundColor White
    Write-Host "  1. Click the sound you like" -ForegroundColor White
    Write-Host "  2. Click 'Download' button" -ForegroundColor White
    Write-Host "  3. Save to: public/sounds/ with the correct filename" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter to open browser pages..." -ForegroundColor Green
    Read-Host
    
    Write-Host ""
    foreach ($sound in $failedDownloads) {
        Write-Host "Opening: $($sound.Name) → Save as: $($sound.File)" -ForegroundColor Cyan
        Start-Process $sound.Browser
        Start-Sleep -Milliseconds 800
    }
    
    Write-Host ""
    Write-Host "✅ All pages opened!" -ForegroundColor Green
    Write-Host ""
    Write-Host "After downloading:" -ForegroundColor Cyan
    Write-Host "  1. Edit src/data/audioFiles.ts" -ForegroundColor White
    Write-Host "  2. Uncomment the 'url' lines for downloaded sounds" -ForegroundColor White
    Write-Host "  3. Run: npm run build" -ForegroundColor White
    Write-Host "  4. Run: npm run dev" -ForegroundColor White
} else {
    Write-Host "🎉 All sounds downloaded successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📁 Files location: public/sounds/" -ForegroundColor Cyan
Write-Host ""

# Show what we have
if (Test-Path "public/sounds") {
    $files = Get-ChildItem "public/sounds" -Filter "*.mp3"
    if ($files.Count -gt 0) {
        Write-Host "📦 Downloaded files:" -ForegroundColor Green
        foreach ($file in $files) {
            $size = [math]::Round($file.Length / 1KB, 2)
            Write-Host "  ✅ $($file.Name) ($size KB)" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️  No files in public/sounds/ yet" -ForegroundColor Yellow
        Write-Host "Please download manually from the browser pages that opened." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check public/sounds/ folder for downloaded files" -ForegroundColor White
Write-Host "  2. Download any remaining files from browser" -ForegroundColor White
Write-Host "  3. Edit src/data/audioFiles.ts and uncomment URLs" -ForegroundColor White
Write-Host "  4. Rebuild: npm run build" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: download-sounds.md" -ForegroundColor Yellow
Write-Host ""


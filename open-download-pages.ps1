# PowerShell script to open all sound download pages in your browser
# This will open each URL in a new tab for easy downloading

Write-Host "🎵 Opening Sound Download Pages..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT WARNING:" -ForegroundColor Red
Write-Host "Only save .MP3 audio files to public/sounds/" -ForegroundColor Yellow
Write-Host "DO NOT copy your entire Downloads folder!" -ForegroundColor Red
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Each page will open in a new browser tab"
Write-Host "2. Download the sound you like from each page"
Write-Host "3. Save ONLY the MP3 file to: public/sounds/ directory"
Write-Host "4. Use the exact filename shown in the console"
Write-Host ""
Write-Host "Press Enter to start..." -ForegroundColor Green
Read-Host

# Create sounds directory if it doesn't exist
if (!(Test-Path "public/sounds")) {
    New-Item -ItemType Directory -Path "public/sounds" -Force
    Write-Host "✅ Created public/sounds/ directory" -ForegroundColor Green
}

# Function to open URL and wait
function Open-DownloadPage {
    param($name, $url, $filename)
    Write-Host "Opening: $name" -ForegroundColor Cyan
    Write-Host "  Save as: $filename" -ForegroundColor Yellow
    Start-Process $url
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "🌿 NATURE SOUNDS (Priority 1)" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Open-DownloadPage "Rain" "https://pixabay.com/sound-effects/search/rain%20loop/" "rain.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "Ocean Waves" "https://pixabay.com/sound-effects/search/ocean%20waves/" "ocean.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "Forest" "https://freesound.org/search/?q=forest+birds+loop" "forest.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "River" "https://pixabay.com/sound-effects/search/river%20stream/" "river.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "Birds" "https://pixabay.com/sound-effects/search/birds%20chirping/" "birds.mp3"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "💼 WORKSPACE SOUNDS (Priority 2)" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta

Open-DownloadPage "Coffee Shop" "https://freesound.org/search/?q=cafe+ambience" "coffeeshop.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "Keyboard" "https://pixabay.com/sound-effects/search/keyboard%20typing/" "keyboard.mp3"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🧘 MEDITATION SOUNDS (Priority 3)" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue

Open-DownloadPage "White Noise" "https://pixabay.com/sound-effects/search/white%20noise/" "whitenoise.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "Pink Noise" "https://pixabay.com/sound-effects/search/pink%20noise/" "pinknoise.mp3"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🌦️ WEATHER SOUNDS (Priority 4)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

Open-DownloadPage "Thunderstorm" "https://pixabay.com/sound-effects/search/thunderstorm/" "thunderstorm.mp3"
Start-Sleep -Seconds 2

Open-DownloadPage "Heavy Rain" "https://pixabay.com/sound-effects/search/heavy%20rain/" "heavyrain.mp3"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ All download pages opened!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Download sounds from each tab" -ForegroundColor White
Write-Host "2. Save to: public/sounds/ directory" -ForegroundColor White
Write-Host "3. Edit src/data/audioFiles.ts and uncomment the URLs" -ForegroundColor White
Write-Host "4. Run: npm run build" -ForegroundColor White
Write-Host "5. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For full list of 27 sounds, see: download-sounds.md" -ForegroundColor Yellow
Write-Host ""

# Optional: Open remaining sounds
Write-Host "Want to open ALL 27 sound pages? (y/N): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Opening remaining sounds..." -ForegroundColor Cyan
    
    Open-DownloadPage "Crickets" "https://pixabay.com/sound-effects/search/crickets/" "crickets.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Wind" "https://mixkit.co/free-sound-effects/wind/" "wind.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Snow" "https://freesound.org/search/?q=snow+ambience" "snow.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "City" "https://freesound.org/search/?q=city+ambience" "city.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Traffic" "https://pixabay.com/sound-effects/search/traffic/" "traffic.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Subway" "https://freesound.org/search/?q=subway+train" "subway.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Library" "https://freesound.org/search/?q=library+ambience" "library.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Office" "https://freesound.org/search/?q=office+ambience" "office.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Fan" "https://pixabay.com/sound-effects/search/fan%20white%20noise/" "fan.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Airplane" "https://freesound.org/search/?q=airplane+cabin" "airplane.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Train" "https://freesound.org/search/?q=train+journey" "train.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Boat" "https://freesound.org/search/?q=boat+sailing" "boat.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Brown Noise" "https://freesound.org/search/?q=brown+noise" "brownnoise.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Tibetan Bowl" "https://pixabay.com/sound-effects/search/singing%20bowl/" "tibetan.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Om Chant" "https://freesound.org/search/?q=om+chant" "om.mp3"
    Start-Sleep -Seconds 1
    
    Open-DownloadPage "Binaural Beats" "https://pixabay.com/sound-effects/search/binaural%20beats/" "binaural.mp3"
    
    Write-Host ""
    Write-Host "✅ All 27 pages opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Happy downloading! 🎉" -ForegroundColor Green


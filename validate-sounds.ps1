# Validation script to check for unwanted files in public/sounds/
# This helps prevent accidentally copying non-audio files to the sounds folder

Write-Host "🔍 Validating public/sounds/ directory..." -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path "public/sounds")) {
    Write-Host "❌ public/sounds/ directory not found" -ForegroundColor Red
    Write-Host "Create it with: New-Item -ItemType Directory -Path 'public/sounds'" -ForegroundColor Yellow
    exit 1
}

# Get all files
$allFiles = Get-ChildItem "public/sounds" -File -Recurse
$mp3Files = $allFiles | Where-Object { $_.Extension -eq ".mp3" }
$nonAudioFiles = $allFiles | Where-Object { $_.Extension -ne ".mp3" -and $_.Name -ne ".gitkeep" }

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total files: $($allFiles.Count)" -ForegroundColor White
Write-Host "  MP3 files: $($mp3Files.Count)" -ForegroundColor Green
Write-Host "  Non-audio files: $($nonAudioFiles.Count)" -ForegroundColor $(if ($nonAudioFiles.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($mp3Files.Count -gt 0) {
    Write-Host "✅ Valid Sound Files:" -ForegroundColor Green
    foreach ($file in $mp3Files) {
        $size = [math]::Round($file.Length / 1KB, 2)
        Write-Host "  🎵 $($file.Name) ($size KB)" -ForegroundColor White
    }
    Write-Host ""
}

if ($nonAudioFiles.Count -gt 0) {
    Write-Host "⚠️  WARNING: Non-audio files detected!" -ForegroundColor Red
    Write-Host "These files should NOT be in public/sounds/:" -ForegroundColor Yellow
    Write-Host ""
    
    $fileTypes = $nonAudioFiles | Group-Object Extension | Sort-Object Count -Descending
    foreach ($type in $fileTypes) {
        $ext = if ($type.Name) { $type.Name } else { "(no extension)" }
        Write-Host "  $ext : $($type.Count) files" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "First 10 examples:" -ForegroundColor Yellow
    $nonAudioFiles | Select-Object -First 10 | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "  ❌ $($_.Name) ($size KB)" -ForegroundColor Red
    }
    
    if ($nonAudioFiles.Count -gt 10) {
        Write-Host "  ... and $($nonAudioFiles.Count - 10) more" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🛠️  RECOMMENDED ACTION:" -ForegroundColor Cyan
    Write-Host "Move these files OUT of public/sounds/ immediately!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick fix commands:" -ForegroundColor White
    Write-Host "  # Create recovery folder" -ForegroundColor Gray
    Write-Host "  New-Item -ItemType Directory -Path 'RECOVERED_FILES' -Force" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Move non-MP3 files to recovery folder" -ForegroundColor Gray
    Write-Host "  Get-ChildItem 'public\sounds\*' -Exclude *.mp3 | Move-Item -Destination 'RECOVERED_FILES\' -Force" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Do you want to move these files to RECOVERED_FILES/ now? (y/N): " -NoNewline -ForegroundColor Red
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "🔧 Moving non-audio files..." -ForegroundColor Cyan
        
        if (!(Test-Path "RECOVERED_FILES")) {
            New-Item -ItemType Directory -Path "RECOVERED_FILES" -Force | Out-Null
        }
        
        $moved = 0
        foreach ($file in $nonAudioFiles) {
            try {
                Move-Item -Path $file.FullName -Destination "RECOVERED_FILES\" -Force
                $moved++
            } catch {
                Write-Host "  ⚠️  Failed to move: $($file.Name)" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "✅ Moved $moved files to RECOVERED_FILES/" -ForegroundColor Green
        Write-Host "Your personal files are safe in: $(Resolve-Path 'RECOVERED_FILES')" -ForegroundColor Cyan
        Write-Host ""
        
        # Verify
        $remaining = Get-ChildItem "public/sounds" -File | Where-Object { $_.Extension -ne ".mp3" -and $_.Name -ne ".gitkeep" }
        if ($remaining.Count -eq 0) {
            Write-Host "✅ public/sounds/ is now clean!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($remaining.Count) files still remain" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "⚠️  Please manually clean up public/sounds/ before committing to git!" -ForegroundColor Yellow
    }
    
    exit 1
} else {
    Write-Host "✅ All good! Only audio files found." -ForegroundColor Green
    Write-Host ""
    Write-Host "Safe to commit to git ✓" -ForegroundColor Green
    exit 0
}


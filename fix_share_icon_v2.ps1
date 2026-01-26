$files = Get-ChildItem "tools/*.html"

foreach ($file in $files) {
    if ($file.Name -eq "numerology.html") { continue }

    $content = Get-Content $file.FullName -Raw
    
    # Replace the mojibake/garbage share icon with a clean Unicode emoji
    if ($content -match "ðŸ“¤") {
        $content = $content -replace "ðŸ“¤", "📤"
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed icon in $($file.Name)"
    }
}
$files = Get-ChildItem "tools/*.html"

foreach ($file in $files) {
    if ($file.Name -eq "numerology.html") { continue }

    $content = Get-Content $file.FullName -Raw
    
    # Regex to match the span with the icon, regardless of what garbage is inside
    $pattern = '<span class="icon">[^<]+</span> Share this Tool'
    $replacement = '<span class="icon">📤</span> Share this Tool'
    
    if ($content -match "Share this Tool") {
        $newContent = [Regex]::Replace($content, $pattern, $replacement)
        
        # Only rewrite if changed
        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            Write-Host "Fixed icon in $($file.Name)"
        }
    }
}
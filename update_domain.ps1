# Update all URLs to the custom domain for better SEO
$files = Get-ChildItem -Recurse -Filter "*.html"
$sitemap = "sitemap.xml"

# Update HTML files
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "anshul6848.github.io") {
        $content = $content -replace "https://anshul6848.github.io", "https://www.qbytex.com"
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated domain in $($file.Name)"
    }
}

# Update Sitemap
if (Test-Path $sitemap) {
    $content = Get-Content $sitemap -Raw
    if ($content -match "anshul6848.github.io") {
        $content = $content -replace "https://anshul6848.github.io", "https://www.qbytex.com"
        Set-Content -Path $sitemap -Value $content -Encoding UTF8
        Write-Host "Updated domain in sitemap.xml"
    }
}
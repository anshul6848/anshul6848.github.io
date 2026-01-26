$files = Get-ChildItem -Recurse -Filter "*.html"

$googleTag = @"
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FJSRJ7EFV7"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-FJSRJ7EFV7');
</script>
"@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if Analytics is already installed to avoid duplicates
    if ($content -notmatch "G-FJSRJ7EFV7") {
        # Insert immediately after <head>
        if ($content -match "<head>") {
            $content = $content -replace "<head>", "<head>`n$googleTag"
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "Added Analytics to $($file.Name)"
        }
    } else {
        Write-Host "Analytics already present in $($file.Name)"
    }
}
$filePath = 'c:\Users\PC\Downloads\dukce experimental - copia\sweets-by-dulce\public\index.html'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Show a portion of the file to debug
$idx = $content.IndexOf("groq: atob")
if ($idx -ge 0) {
    Write-Host "Found 'groq: atob' at position $idx"
    $snippet = $content.Substring($idx, 100)
    Write-Host "Context: $snippet"
} else {
    Write-Host "NOT FOUND: groq: atob"
    Write-Host "Searching for _token_ia..."
    if ($content.Contains("_token_ia")) {
        Write-Host "FOUND: _token_ia already exists - no changes needed"
    }
}

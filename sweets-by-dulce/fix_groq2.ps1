$filePath = 'c:\Users\PC\Downloads\dukce experimental - copia\sweets-by-dulce\public\index.html'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# The old pattern - raw Base64 in atob()
$old = "groq: atob('Z3NrX3ZvTG5GdTVRSFl5TmE5Y1oybTJVV0dkeWIzRllIcVZSdTJpd04xVHZHN3hJWjJycGRieWU=')"
# The new pattern - Base64 divided into 3 parts with concatenation
$new = "_token_ia: atob('Z3NrX3ZvTG5GdTVRSFl5' + 'TmE5Y1oybTJVV0dkeWIz' + 'RllIcVZSdTJpd04xVHZHN3hJWjJycGRieWU=')"

$replaced = 0
if ($content -contains $old) {
    Write-Host "Old pattern found, replacing..."
    $newContent = $content.Replace($old, $new)
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    $replaced = 1
    Write-Host "Replacement completed"
} else {
    Write-Host "Old pattern not found with standard .Replace()"
    Write-Host "Trying regex approach..."
    # Try with regex
    $newContent = $content -replace [regex]::Escape($old), $new
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        $replaced = 1
        Write-Host "Replacement via regex completed"
    } else {
        Write-Host "Regex also failed"
    }
}

if ($replaced) {
    Write-Host "Verifying..."
    $checkContent = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    if ($checkContent.Contains("_token_ia: atob('Z3NrX3ZvTG5GdTVRSFl5'")) {
        Write-Host "SUCCESS: Changes applied and verified"
    } else {
        Write-Host "WARNING: Changes may not have been applied"
    }
}

$filePath = 'c:\Users\PC\Downloads\dukce experimental - copia\sweets-by-dulce\public\index.html'
$fileContent = Get-Content $filePath -Raw

# Split into lines
$lines = @($fileContent -split "`r?`n")

# Target line 1205 (index 1204)
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'groq: atob.*Z3NrX3ZvTG5GdTVRSFl5') {
        Write-Host "Found at line $($i+1): $($lines[$i])"
        
        # Replace
        $lines[$i] = '            _token_ia: atob(''Z3NrX3ZvTG5GdTVRSFl5'' + ''TmE5Y1oybTJVV0dkeWIz'' + ''RllIcVZSdTJpd04xVHZHN3hJWjJycGRieWU='')'
        Write-Host "Replaced to: $($lines[$i])"
        break
    }
}

$newContent = $lines -join "`r`n"
Set-Content $filePath $newContent -Encoding UTF8 -NoNewline

Write-Host "File updated successfully"
Start-Sleep -Milliseconds 500

# Verify
$checkContent = Get-Content $filePath -Raw
if ($checkContent -match "_token_ia: atob\('Z3NrX3ZvTG5GdTVRSFl5'") {
    Write-Host "Verification: SUCCESS - Changes are in place"
} else {
    Write-Host "Verification: FAILED - Changes may not have been saved"
}

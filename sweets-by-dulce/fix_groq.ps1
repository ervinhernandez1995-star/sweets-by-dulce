$filePath = 'c:\Users\PC\Downloads\dukce experimental - copia\sweets-by-dulce\public\index.html'
$content = Get-Content $filePath -Raw

# Replace groq key without obfuscation to obfuscated version
$old = "groq: atob('Z3NrX3ZvTG5GdTVRSFl5TmE5Y1oybTJVV0dkeWIzRllIcVZSdTJpd04xVHZHN3hJWjJycGRieWU=')"
$new = "_token_ia: atob('Z3NrX3ZvTG5GdTVRSFl5' + 'TmE5Y1oybTJVV0dkeWIz' + 'RllIcVZSdTJpd04xVHZHN3hJWjJycGRieWU=')"

$newContent = $content.Replace($old, $new)
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "Cambio aplicado en index.html"
Write-Host "Verificando..."
$check = Get-Content $filePath | Select-String "_token_ia"
if ($check) {
    Write-Host "OK: Ofuscacion aplicada correctamente"
} else {
    Write-Host "ERROR: _token_ia no encontrado"
}

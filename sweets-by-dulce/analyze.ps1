$filePath = 'c:\Users\PC\Downloads\dukce experimental - copia\sweets-by-dulce\public\index.html'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$idx = $content.IndexOf("groq: atob")
if ($idx -ge 0) {
    # Get the exact bytes around the quote marks
    $snippet = $content.Substring($idx, 50)
    Write-Host "Snippet: $snippet"
    
    # Check each character's Unicode value
    for ($i = 0; $i -lt [System.Math]::Min(50, $snippet.Length); $i++) {
        $char = $snippet[$i]
        $charCode = [int]$char
        if ($char -eq "'" -or $char -eq '"' -or $char -eq "'") {
            Write-Host "Char at $i: '$char' (Unicode: $charCode)"
        }
    }
}

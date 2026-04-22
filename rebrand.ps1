
$replaces = @(
    @("bharattrip@gmail.com", "gotripo@gmail.com"),
    @("support@bharattrip.ai", "support@gotripo.tech"),
    @("bharat-trip-opal.vercel.app", "gotripo.tech"),
    @("Bharat Trip", "GoTripo"),
    @("bharat-trip", "gotripo"),
    @("BHARAT TRIP", "GOTRIPO"),
    @("BharatTrip", "GoTripo")
)

$excludePaths = @("node_modules", ".git", "dist", "build", ".next", "rebrand.ps1", "package-lock.json")

Get-ChildItem -Recurse -File | Where-Object { 
    $fullName = $_.FullName
    $match = $false
    foreach ($path in $excludePaths) {
        if ($fullName -match "\\$path\\") {
            $match = $true
            break
        }
    }
    # Also exclude the script itself and package-lock.json explicitly if not caught
    if ($fullName -match "rebrand.ps1" -or $fullName -match "package-lock.json") { $match = $true }
    -not $match
} | ForEach-Object {
    try {
        $filePath = $_.FullName
        $content = [System.IO.File]::ReadAllText($filePath)
        
        $newContent = $content
        $changed = $false
        
        foreach ($pair in $replaces) {
            $old = $pair[0]
            $new = $pair[1]
            $regex = [regex]::Escape($old)
            
            if ($newContent -match $regex) {
                # Case-sensitive replace
                $newContent = [regex]::Replace($newContent, $regex, $new)
                $changed = $true
            }
        }
        
        if ($changed) {
            $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($filePath, $newContent, $Utf8NoBomEncoding)
            Write-Host "Updated: $filePath"
        }
    } catch {
        Write-Warning "Failed to process ${filePath}: $($_.Exception.Message)"
    }
}

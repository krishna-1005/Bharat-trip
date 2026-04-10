
$replaces = @(
    @("support@bharattrip.ai", "support@gotripo.com"),
    @("bharattrip@gmail.com", "gotripo@gmail.com"),
    @("bharat-trip-opal.vercel.app", "gotripo.vercel.app"),
    @("Bharat <span>Trip</span>", "Go<span>Tripo</span>"),
    @("Bharat Trip", "GoTripo"),
    @("BharatTrip", "GoTripo"),
    @("bharat-trip", "gotripo"),
    @("bharattrip", "gotripo"),
    @("BHARAT TRIP", "GOTRIPO"),
    @("bharat_trip", "gotripo")
)

$excludePaths = @("node_modules", ".git", "dist", "build", ".next", "rebrand.ps1")

Get-ChildItem -Recurse -File | Where-Object { 
    $fullName = $_.FullName
    $match = $false
    foreach ($path in $excludePaths) {
        if ($fullName -match "\\$path\\") {
            $match = $true
            break
        }
    }
    # Also exclude the script itself
    if ($fullName -match "rebrand.ps1") { $match = $true }
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

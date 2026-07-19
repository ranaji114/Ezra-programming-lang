param(
    [string]$Repo = "ranaji114/Flux-programming-lang",
    [string]$Version = "latest",
    [string]$InstallDir = "$env:LOCALAPPDATA\Flux\bin"
)

$ErrorActionPreference = "Stop"

$assetName = "flux-windows-x86_64.zip"
$releaseApi = if ($Version -eq "latest") {
    "https://api.github.com/repos/$Repo/releases/latest"
} else {
    "https://api.github.com/repos/$Repo/releases/tags/$Version"
}

Write-Host "Fetching Flux release metadata from $Repo..."
$release = Invoke-RestMethod -Uri $releaseApi
$asset = $release.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1

if (-not $asset) {
    throw "Could not find release asset $assetName in $Repo"
}

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("flux-install-" + [System.Guid]::NewGuid())
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

try {
    $zipPath = Join-Path $tempDir $assetName
    Write-Host "Downloading $assetName..."
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (($userPath -split ";") -notcontains $InstallDir) {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$InstallDir", "User")
        Write-Host "Added $InstallDir to user PATH. Restart your terminal."
    }

    Write-Host "Flux installed at $InstallDir"
    Write-Host "Run: flux --version"
}
finally {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
}

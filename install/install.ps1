# Ezra Language - Windows Installer
# Author: Ankur Rana
# Usage: powershell -ExecutionPolicy Bypass -File install\install.ps1

param(
    [string]$Repo = "ranaji114/Flux-programming-lang",
    [string]$Version = "latest",
    [string]$InstallDir = "",
    [switch]$Silent
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

if ($InstallDir -eq "") {
    $InstallDir = Join-Path $env:LOCALAPPDATA "Ezra\bin"
}

function Write-Step($msg) { if (-not $Silent) { Write-Host "  >> $msg" -ForegroundColor Cyan } }
function Write-Ok($msg)   { if (-not $Silent) { Write-Host "  OK $msg" -ForegroundColor Green } }
function Write-Fail($msg) { Write-Host "  FAIL $msg" -ForegroundColor Red }

if (-not $Silent) {
    Write-Host ""
    Write-Host "  Ezra Language Installer" -ForegroundColor Magenta
    Write-Host "  Created by Ankur Rana" -ForegroundColor Gray
    Write-Host "  https://github.com/ranaji114/Flux-programming-lang" -ForegroundColor Gray
    Write-Host ""
}

$assetName = "ezra-windows-x86_64-1.0.0.zip"

if ($Version -eq "latest") {
    $releaseApi = "https://api.github.com/repos/$Repo/releases/latest"
} else {
    $releaseApi = "https://api.github.com/repos/$Repo/releases/tags/v$Version"
}

Write-Step "Fetching release info from GitHub..."

try {
    $headers = @{ "User-Agent" = "ezra-installer/1.0" }
    $release = Invoke-RestMethod -Uri $releaseApi -Headers $headers
} catch {
    Write-Fail "Cannot reach GitHub. Check your internet connection."
    Write-Host ""
    Write-Host "  Download manually from:" -ForegroundColor Yellow
    Write-Host "  https://github.com/$Repo/releases/latest" -ForegroundColor Yellow
    exit 1
}

$asset = $null
foreach ($a in $release.assets) {
    if ($a.name -eq $assetName) { $asset = $a; break }
}

if ($null -eq $asset) {
    Write-Fail "Asset '$assetName' not found in release $($release.tag_name)"
    Write-Host "  NOTE: GitHub Actions must complete the release build first." -ForegroundColor Yellow
    Write-Host "  Check: https://github.com/$Repo/actions" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Available assets:" -ForegroundColor Yellow
    foreach ($a in $release.assets) { Write-Host "    $($a.name)" }
    exit 1
}

$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("ezra-install-" + [System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

try {
    $zipPath = Join-Path $tmp $assetName
    $sizeMB = [math]::Round($asset.size / 1048576, 1)
    Write-Step "Downloading $assetName ($sizeMB MB)..."
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

    Write-Step "Installing to $InstallDir..."
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($null -eq $userPath) { $userPath = "" }
    $pathParts = $userPath -split ";" | Where-Object { $_ -ne "" }

    $alreadyInPath = $false
    foreach ($p in $pathParts) {
        if ($p.TrimEnd("\") -eq $InstallDir.TrimEnd("\")) {
            $alreadyInPath = $true
            break
        }
    }

    if (-not $alreadyInPath) {
        $newPath = ($pathParts + $InstallDir) -join ";"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Ok "Added to PATH"
    } else {
        Write-Ok "Already in PATH"
    }

    $env:PATH = $env:PATH + ";" + $InstallDir

    $exePath = Join-Path $InstallDir "ezra.exe"
    if (Test-Path $exePath) {
        $v = & $exePath --version 2>&1
        Write-Ok "Installed: $v"
    } else {
        Write-Host "  WARNING: ezra.exe not found at $exePath" -ForegroundColor Yellow
    }

    if (-not $Silent) {
        Write-Host ""
        Write-Host "  Ezra installed!" -ForegroundColor Green
        Write-Host "  Restart your terminal, then run: ezra --version" -ForegroundColor White
        Write-Host ""
    }

} finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
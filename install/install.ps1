# Ezra Language — Windows Installer
# Author: Ankur Rana
# Usage:  powershell -ExecutionPolicy Bypass -File install.ps1
# Options:
#   -Repo     "owner/repo"   (default: ranaji114/Flux-programming-lang)
#   -Version  "1.0.0"        (default: latest)
#   -InstallDir "C:\..."     (default: %LOCALAPPDATA%\Ezra\bin)
#   -Silent                  (no prompts)

param(
    [string]$Repo       = "ranaji114/Flux-programming-lang",
    [string]$Version    = "latest",
    [string]$InstallDir = "$env:LOCALAPPDATA\Ezra\bin",
    [switch]$Silent
)

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"   # speed up Invoke-WebRequest

function Write-Step($msg) { if (-not $Silent) { Write-Host "  → $msg" -ForegroundColor Cyan } }
function Write-Done($msg) { if (-not $Silent) { Write-Host "  ✓ $msg" -ForegroundColor Green } }
function Write-Fail($msg) { Write-Host "  ✗ $msg" -ForegroundColor Red }

if (-not $Silent) {
    Write-Host ""
    Write-Host "  Ezra Language Installer" -ForegroundColor Magenta
    Write-Host "  Created by Ankur Rana" -ForegroundColor DarkGray
    Write-Host "  https://github.com/ranaji114/Flux-programming-lang" -ForegroundColor DarkGray
    Write-Host ""
}

# Resolve release API URL
$assetName  = "ezra-windows-x86_64-1.0.0.zip"
$releaseApi = if ($Version -eq "latest") {
    "https://api.github.com/repos/$Repo/releases/latest"
} else {
    "https://api.github.com/repos/$Repo/releases/tags/v$Version"
}

Write-Step "Fetching release metadata from GitHub..."
try {
    $release = Invoke-RestMethod -Uri $releaseApi -Headers @{ "User-Agent" = "ezra-installer/1.0" }
} catch {
    Write-Fail "Could not reach GitHub API: $_"
    Write-Host "  If you are offline, download manually from:" -ForegroundColor Yellow
    Write-Host "  https://github.com/$Repo/releases/latest" -ForegroundColor Yellow
    exit 1
}

$asset = $release.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1
if (-not $asset) {
    Write-Fail "Asset '$assetName' not found in release $($release.tag_name)"
    Write-Host "  Available assets:" -ForegroundColor Yellow
    $release.assets | ForEach-Object { Write-Host "    $($_.name)" }
    exit 1
}

# Verify SHA256 if checksum file exists
$sha256Asset = $release.assets | Where-Object { $_.name -eq "$assetName.sha256" } | Select-Object -First 1

# Download to temp
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "ezra-install-$([System.Guid]::NewGuid())"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

try {
    $zipPath = Join-Path $tmp $assetName
    Write-Step "Downloading $assetName ($([math]::Round($asset.size / 1MB, 1)) MB)..."
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

    # Verify checksum if available
    if ($sha256Asset) {
        $checksumFile = Join-Path $tmp "$assetName.sha256"
        Invoke-WebRequest -Uri $sha256Asset.browser_download_url -OutFile $checksumFile
        $expected = ((Get-Content $checksumFile) -split '\s+')[0].ToLower()
        $actual   = (Get-FileHash $zipPath -Algorithm SHA256).Hash.ToLower()
        if ($expected -ne $actual) {
            Write-Fail "SHA256 mismatch! Expected: $expected  Got: $actual"
            exit 1
        }
        Write-Done "Checksum verified"
    }

    # Extract
    Write-Step "Installing to $InstallDir..."
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force

    # Add to PATH
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User") ?? ""
    $pathParts = $userPath -split ";" | Where-Object { $_ -ne "" }
    if ($pathParts -notcontains $InstallDir) {
        $newPath = ($pathParts + $InstallDir) -join ";"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Done "Added to PATH (restart terminal to take effect)"
    } else {
        Write-Done "Already in PATH"
    }

    # Notify shell of PATH change
    $env:PATH = "$env:PATH;$InstallDir"

    # Verify
    $exePath = Join-Path $InstallDir "ezra.exe"
    if (Test-Path $exePath) {
        $v = & $exePath --version 2>&1
        Write-Done "Installation verified: $v"
    }

    if (-not $Silent) {
        Write-Host ""
        Write-Host "  Ezra installed successfully!" -ForegroundColor Green
        Write-Host "  Run: ezra --version" -ForegroundColor White
        Write-Host "  Run: ezra new my_app && cd my_app && ezra run" -ForegroundColor White
        Write-Host ""
    }

} finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

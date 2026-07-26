# Ezra Language - Windows One-Click Installer
# Author: Ankur Rana
# Usage: powershell -ExecutionPolicy Bypass -File install.ps1
# Or run directly from web: iwr https://raw.githubusercontent.com/ranaji114/Flux-programming-lang/main/install/install.ps1 | iex

param(
    [string]$Version = "1.0.0",
    [string]$InstallDir = "",
    [switch]$Silent
)

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"

if ($InstallDir -eq "") {
    $InstallDir = Join-Path $env:LOCALAPPDATA "Ezra\bin"
}

function Write-Step($msg) { if (-not $Silent) { Write-Host "  >> $msg" -ForegroundColor Cyan } }
function Write-Ok($msg)   { if (-not $Silent) { Write-Host "  OK $msg" -ForegroundColor Green } }
function Write-Fail($msg) { Write-Host "  FAIL $msg" -ForegroundColor Red; exit 1 }

if (-not $Silent) {
    Write-Host ""
    Write-Host "  Ezra Language Installer v$Version" -ForegroundColor Magenta
    Write-Host "  Created by Ankur Rana" -ForegroundColor Gray
    Write-Host ""
}

# Download URL - direct link to the zip asset
$Repo = "ranaji114/Flux-programming-lang"
$AssetName = "ezra-windows-x86_64-$Version.zip"

# Try GitHub Releases API first
$DownloadUrl = ""
Write-Step "Finding release on GitHub..."

try {
    $headers = @{ "User-Agent" = "ezra-installer/1.0" }
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/tags/v$Version" -Headers $headers
    foreach ($a in $release.assets) {
        if ($a.name -eq $AssetName) {
            $DownloadUrl = $a.browser_download_url
            break
        }
    }
} catch {
    # Fallback: try latest release
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers $headers
        foreach ($a in $release.assets) {
            if ($a.name -like "ezra-windows-x86_64-*.zip") {
                $DownloadUrl = $a.browser_download_url
                $AssetName   = $a.name
                break
            }
        }
    } catch {
        Write-Fail "Cannot reach GitHub. Check your internet and try again."
    }
}

if ($DownloadUrl -eq "") {
    Write-Host ""
    Write-Host "  Release assets not found on GitHub yet." -ForegroundColor Yellow
    Write-Host "  Check: https://github.com/$Repo/releases" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Manual install steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://github.com/$Repo/releases" -ForegroundColor White
    Write-Host "  2. Download: $AssetName" -ForegroundColor White
    Write-Host "  3. Extract ezra.exe to a folder in your PATH" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Download
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("ezra-" + [System.Guid]::NewGuid().ToString("N").Substring(0,8))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

try {
    $zipPath = Join-Path $tmp $AssetName
    Write-Step "Downloading $AssetName..."
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $zipPath

    # Verify download
    if (-not (Test-Path $zipPath) -or (Get-Item $zipPath).Length -lt 1000) {
        Write-Fail "Download failed or file is too small."
    }

    # Extract
    Write-Step "Installing to $InstallDir..."
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $tmp -Force

    # Copy ezra.exe and ezra-lsp.exe
    $exeSrc = Join-Path $tmp "ezra.exe"
    $lspSrc = Join-Path $tmp "ezra-lsp.exe"

    if (-not (Test-Path $exeSrc)) {
        Write-Fail "ezra.exe not found in archive. Archive may be corrupted."
    }

    Copy-Item $exeSrc (Join-Path $InstallDir "ezra.exe") -Force
    if (Test-Path $lspSrc) {
        Copy-Item $lspSrc (Join-Path $InstallDir "ezra-lsp.exe") -Force
    }

    # Copy std library
    $stdSrc = Join-Path $tmp "std"
    $stdDst = Join-Path (Split-Path $InstallDir -Parent) "std"
    if (Test-Path $stdSrc) {
        Copy-Item $stdSrc $stdDst -Recurse -Force
    }

    # Copy examples
    $examplesSrc = Join-Path $tmp "examples"
    $examplesDst = Join-Path (Split-Path $InstallDir -Parent) "examples"
    if (Test-Path $examplesSrc) {
        Copy-Item $examplesSrc $examplesDst -Recurse -Force
    }

    # Add to PATH
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($null -eq $userPath) { $userPath = "" }
    $pathParts = $userPath -split ";" | Where-Object { $_ -ne "" }

    $alreadyIn = $false
    foreach ($p in $pathParts) {
        if ($p.TrimEnd("\") -eq $InstallDir.TrimEnd("\")) { $alreadyIn = $true; break }
    }

    if (-not $alreadyIn) {
        $newPath = ($pathParts + $InstallDir) -join ";"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Ok "Added to PATH"
    } else {
        Write-Ok "Already in PATH"
    }

    # Broadcast PATH change so new terminals pick it up
    $env:PATH = $env:PATH + ";" + $InstallDir

    # Verify
    $ezraExe = Join-Path $InstallDir "ezra.exe"
    $v = & $ezraExe --version 2>&1
    Write-Ok "Installed: $v"

    if (-not $Silent) {
        Write-Host ""
        Write-Host "  Ezra installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Installed to: $InstallDir" -ForegroundColor White
        Write-Host "  Restart your terminal, then run:" -ForegroundColor White
        Write-Host ""
        Write-Host "    ezra --version" -ForegroundColor Yellow
        Write-Host "    ezra new my_app" -ForegroundColor Yellow
        Write-Host "    cd my_app" -ForegroundColor Yellow
        Write-Host "    ezra run" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Docs: https://ranaji114.github.io/Flux-programming-lang" -ForegroundColor Cyan
        Write-Host ""
    }

} finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
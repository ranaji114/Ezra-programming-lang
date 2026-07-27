# Ezra Language - Windows Installer
# Author: Ankur Rana
# Usage: powershell -ExecutionPolicy Bypass -File install.ps1

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

$Repo      = "ranaji114/Ezra-programming-lang"
$AssetName = "ezra-windows-x86_64-$Version.zip"
$DownloadUrl = ""

Write-Step "Finding release on GitHub..."
try {
    $headers = @{ "User-Agent" = "ezra-installer/1.0" }
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/tags/v$Version" -Headers $headers
    foreach ($a in $release.assets) {
        if ($a.name -eq $AssetName) { $DownloadUrl = $a.browser_download_url; break }
    }
} catch {}

if ($DownloadUrl -eq "") {
    try {
        $headers = @{ "User-Agent" = "ezra-installer/1.0" }
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers $headers
        foreach ($a in $release.assets) {
            if ($a.name -like "ezra-windows-*.zip") { $DownloadUrl = $a.browser_download_url; $AssetName = $a.name; break }
        }
    } catch {
        Write-Fail "Cannot reach GitHub. Check your internet connection."
    }
}

if ($DownloadUrl -eq "") {
    Write-Fail "No release asset found. Visit: https://github.com/$Repo/releases"
}

$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("ezra-" + [System.Guid]::NewGuid().ToString("N").Substring(0,8))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

try {
    $zipPath = Join-Path $tmp $AssetName
    Write-Step "Downloading $AssetName..."
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $zipPath

    Write-Step "Installing to $InstallDir..."
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $tmp -Force

    # Copy binaries
    $exeSrc = Join-Path $tmp "ezra.exe"
    $lspSrc = Join-Path $tmp "ezra-lsp.exe"
    if (-not (Test-Path $exeSrc)) { Write-Fail "ezra.exe not found in archive." }
    Copy-Item $exeSrc (Join-Path $InstallDir "ezra.exe") -Force
    if (Test-Path $lspSrc) { Copy-Item $lspSrc (Join-Path $InstallDir "ezra-lsp.exe") -Force }

    # Copy std and examples
    $parent = Split-Path $InstallDir -Parent
    $stdSrc  = Join-Path $tmp "std"
    $exSrc   = Join-Path $tmp "examples"
    if (Test-Path $stdSrc) { Copy-Item $stdSrc  (Join-Path $parent "std")      -Recurse -Force }
    if (Test-Path $exSrc)  { Copy-Item $exSrc   (Join-Path $parent "examples") -Recurse -Force }

    # Add to User PATH (for future terminals)
    $userPath  = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($null -eq $userPath) { $userPath = "" }
    $parts = $userPath -split ";" | Where-Object { $_ -ne "" }
    $alreadyIn = $false
    foreach ($p in $parts) { if ($p.TrimEnd("\") -eq $InstallDir.TrimEnd("\")) { $alreadyIn = $true; break } }
    if (-not $alreadyIn) {
        [Environment]::SetEnvironmentVariable("Path", ($parts + $InstallDir -join ";"), "User")
        Write-Ok "Added to User PATH"
    }

    # Add to PowerShell profile (works immediately in new terminals)
    $profilePath = $PROFILE
    if (-not (Test-Path (Split-Path $profilePath -ErrorAction SilentlyContinue))) {
        New-Item -ItemType Directory -Force -Path (Split-Path $profilePath) | Out-Null
    }
    $profileContent = if (Test-Path $profilePath) { Get-Content $profilePath -Raw } else { "" }
    if ($profileContent -notlike "*Ezra\bin*") {
        Add-Content $profilePath "`n# Ezra Language`n`$env:PATH = `"`$env:PATH;$InstallDir`"`n"
        Write-Ok "Added to PowerShell profile"
    }

    # Update current session PATH immediately
    $env:PATH = "$env:PATH;$InstallDir"

    # Verify
    $ezraExe = Join-Path $InstallDir "ezra.exe"
    $v = & $ezraExe --version 2>&1
    Write-Ok "Installed: $v"

    if (-not $Silent) {
        Write-Host ""
        Write-Host "  Ezra installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  You can now run:" -ForegroundColor White
        Write-Host "    ezra --version" -ForegroundColor Yellow
        Write-Host "    ezra new my_app" -ForegroundColor Yellow
        Write-Host "    ezra run my_file.ez" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  NOTE: Open a NEW terminal for ezra to be available." -ForegroundColor Yellow
        Write-Host "  Or paste this in current terminal:" -ForegroundColor White
        Write-Host "    `$env:PATH = `"`$env:PATH;$InstallDir`"" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Docs: https://ranaji114.github.io/Ezra-programming-lang" -ForegroundColor Cyan
        Write-Host ""
    }

} finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
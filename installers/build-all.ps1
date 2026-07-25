# build-all.ps1 — Build all Ezra release artifacts on Windows
# Author: Ankur Rana
# Usage: .\installers\build-all.ps1 [-Version "0.1.0"] [-SkipTests] [-Package]
param(
    [string]$Version = "0.1.0",
    [switch]$SkipTests,
    [switch]$Package,
    [switch]$All
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Push-Location $Root

try {
    Write-Host "`n=== Ezra v$Version — Windows Build ===" -ForegroundColor Cyan

    # 1. Format check
    Write-Host "`n--- Format check ---" -ForegroundColor Yellow
    cargo fmt -- --check
    if ($LASTEXITCODE -ne 0) { throw "Format check failed" }

    # 2. Clippy (warnings only — no -D warnings to allow incremental progress)
    Write-Host "`n--- Clippy ---" -ForegroundColor Yellow
    cargo clippy
    if ($LASTEXITCODE -ne 0) { throw "Clippy failed" }

    # 3. Tests
    if (-not $SkipTests) {
        Write-Host "`n--- Tests ---" -ForegroundColor Yellow
        cargo test
        if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
    }

    # 4. Release build
    Write-Host "`n--- Release build ---" -ForegroundColor Yellow
    cargo build --release
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Host "Binary: target\release\ezra.exe"

    # 5. Package
    if ($Package -or $All) {
        Write-Host "`n--- Package ---" -ForegroundColor Yellow
        $archive = "ezra-windows-x86_64-$Version.zip"
        $items = @("target\release\ezra.exe", "README.md", "examples", "std")
        $existing = $items | Where-Object { Test-Path $_ }
        Compress-Archive -Path $existing -DestinationPath $archive -Force
        Write-Host "Archive: $archive"

        # SHA256
        $hash = (Get-FileHash $archive -Algorithm SHA256).Hash.ToLower()
        "$hash  $archive" | Add-Content "SHA256SUMS"
        Write-Host "SHA256: $hash"

        # Build with Inno Setup if available
        $iscc = Get-Command "iscc" -ErrorAction SilentlyContinue
        if ($iscc) {
            Write-Host "`n--- Inno Setup installer ---" -ForegroundColor Yellow
            Push-Location "installers\windows"
            iscc ezra-setup.iss
            Pop-Location
        } else {
            Write-Host "Inno Setup (iscc) not found — skipping .msi build" -ForegroundColor DarkYellow
            Write-Host "Install from: https://jrsoftware.org/isinfo.php"
        }
    }

    Write-Host "`n=== Done: Ezra v$Version ===" -ForegroundColor Green

} finally {
    Pop-Location
}

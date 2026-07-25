# build.ps1 — Build and package Ezra for Windows
# Usage:  .\build.ps1 [-Release] [-Package] [-Test]
param(
    [switch]$Release,
    [switch]$Package,
    [switch]$Test,
    [switch]$All
)

$ErrorActionPreference = "Stop"
$version = (Get-Content Cargo.toml | Select-String 'version = "(.+)"' | Select-Object -First 1).Matches.Groups[1].Value

function Step($label) { Write-Host "`n==> $label" -ForegroundColor Cyan }

if ($All) { $Release = $true; $Package = $true; $Test = $true }

# --- Quality checks -------------------------------------------------------
Step "Format check"
cargo fmt -- --check
if ($LASTEXITCODE -ne 0) { throw "Formatting check failed. Run: cargo fmt" }

Step "Clippy lint"
cargo clippy
if ($LASTEXITCODE -ne 0) { throw "Clippy found issues" }

# --- Tests ----------------------------------------------------------------
if ($Test -or $All) {
    Step "Tests"
    cargo test
    if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
}

# --- Release build --------------------------------------------------------
if ($Release -or $Package -or $All) {
    Step "Release build"
    cargo build --release
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Host "  Binary: target\release\ezra.exe"
}

# --- Package --------------------------------------------------------------
if ($Package -or $All) {
    Step "Package ezra-windows-x86_64.zip"
    $outzip = "ezra-windows-x86_64.zip"
    if (Test-Path $outzip) { Remove-Item $outzip }
    Compress-Archive -Path "target\release\ezra.exe", "target\release\ezra-lsp.exe", "README.md", "examples" -DestinationPath $outzip
    Write-Host "  Archive: $outzip"
}

Write-Host "`nDone — Ezra v$version" -ForegroundColor Green

#requires -version 5.1
# Ezra Language - Windows GUI Installer
# Author: Ankur Rana
# Converts to .exe with: ps2exe ezra-installer-gui.ps1 EzraSetup-1.0.0.exe

param([switch]$Silent)

$VERSION     = "1.0.0"
$REPO        = "ranaji114/Flux-programming-lang"
$ASSET_NAME  = "ezra-windows-x86_64-$VERSION.zip"
$DEFAULT_DIR = Join-Path $env:LOCALAPPDATA "Ezra"
$BIN_DIR     = Join-Path $DEFAULT_DIR "bin"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ---- Helper ----------------------------------------------------------------
function Show-Error($msg) {
    [System.Windows.Forms.MessageBox]::Show($msg, "Ezra Installer - Error",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error) | Out-Null
}

function Add-ToPath($dir) {
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($null -eq $userPath) { $userPath = "" }
    $parts = $userPath -split ";" | Where-Object { $_ -ne "" }
    $already = $parts | Where-Object { $_.TrimEnd("\") -eq $dir.TrimEnd("\") }
    if (-not $already) {
        $new = ($parts + $dir) -join ";"
        [Environment]::SetEnvironmentVariable("Path", $new, "User")
    }
    # Add to PowerShell profile
    try {
        $profileDir = Split-Path $PROFILE
        if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Force -Path $profileDir | Out-Null }
        $profileContent = if (Test-Path $PROFILE) { Get-Content $PROFILE -Raw } else { "" }
        if ($profileContent -notlike "*Ezra\bin*") {
            Add-Content $PROFILE "`n# Ezra Language`n`$env:PATH = `"`$env:PATH;$dir`"`n"
        }
    } catch {}
    # Update current session
    $env:PATH = "$env:PATH;$dir"
}

# ---- Silent mode -----------------------------------------------------------
if ($Silent) {
    $ProgressPreference = "SilentlyContinue"
    try {
        $rel = Invoke-RestMethod "https://api.github.com/repos/$REPO/releases/tags/v$VERSION" -Headers @{"User-Agent"="ezra-installer"}
        $url = ($rel.assets | Where-Object { $_.name -eq $ASSET_NAME }).browser_download_url
        $tmp = Join-Path ([IO.Path]::GetTempPath()) "ezra-install"
        New-Item -ItemType Directory -Force -Path $tmp | Out-Null
        $zip = Join-Path $tmp $ASSET_NAME
        Invoke-WebRequest $url -OutFile $zip
        New-Item -ItemType Directory -Force -Path $BIN_DIR | Out-Null
        Expand-Archive $zip -DestinationPath $tmp -Force
        Copy-Item (Join-Path $tmp "ezra.exe")     (Join-Path $BIN_DIR "ezra.exe")     -Force
        Copy-Item (Join-Path $tmp "ezra-lsp.exe") (Join-Path $BIN_DIR "ezra-lsp.exe") -Force -ErrorAction SilentlyContinue
        $stdSrc = Join-Path $tmp "std";     if (Test-Path $stdSrc)     { Copy-Item $stdSrc     (Join-Path $DEFAULT_DIR "std")     -Recurse -Force }
        $exSrc  = Join-Path $tmp "examples"; if (Test-Path $exSrc)      { Copy-Item $exSrc      (Join-Path $DEFAULT_DIR "examples") -Recurse -Force }
        Add-ToPath $BIN_DIR
        Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Ezra $VERSION installed to $BIN_DIR"
        exit 0
    } catch {
        Write-Host "Install failed: $_"
        exit 1
    }
}

# ---- GUI -------------------------------------------------------------------
$form = New-Object System.Windows.Forms.Form
$form.Text          = "Ezra Language Setup $VERSION"
$form.Size          = New-Object System.Drawing.Size(520, 480)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox   = $false
$form.MinimizeBox   = $false
$form.BackColor     = [System.Drawing.Color]::White

# Title banner
$banner = New-Object System.Windows.Forms.Panel
$banner.Dock      = "Top"
$banner.Height    = 80
$banner.BackColor = [System.Drawing.Color]::FromArgb(30, 10, 60)
$form.Controls.Add($banner)

$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text      = "Ezra Language $VERSION"
$titleLabel.Font      = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.Location  = New-Object System.Drawing.Point(20, 12)
$titleLabel.Size      = New-Object System.Drawing.Size(400, 35)
$banner.Controls.Add($titleLabel)

$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text      = "Created by Ankur Rana  |  A readable scripting language"
$subtitleLabel.Font      = New-Object System.Drawing.Font("Segoe UI", 9)
$subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(180, 160, 220)
$subtitleLabel.Location  = New-Object System.Drawing.Point(22, 50)
$subtitleLabel.Size      = New-Object System.Drawing.Size(460, 20)
$banner.Controls.Add($subtitleLabel)

# Install dir label
$dirLabel = New-Object System.Windows.Forms.Label
$dirLabel.Text     = "Install location:"
$dirLabel.Font     = New-Object System.Drawing.Font("Segoe UI", 10)
$dirLabel.Location = New-Object System.Drawing.Point(20, 105)
$dirLabel.Size     = New-Object System.Drawing.Size(130, 25)
$form.Controls.Add($dirLabel)

$dirBox = New-Object System.Windows.Forms.TextBox
$dirBox.Text     = $DEFAULT_DIR
$dirBox.Font     = New-Object System.Drawing.Font("Segoe UI", 10)
$dirBox.Location = New-Object System.Drawing.Point(20, 130)
$dirBox.Size     = New-Object System.Drawing.Size(370, 25)
$form.Controls.Add($dirBox)

$browseBtn = New-Object System.Windows.Forms.Button
$browseBtn.Text     = "Browse..."
$browseBtn.Font     = New-Object System.Drawing.Font("Segoe UI", 9)
$browseBtn.Location = New-Object System.Drawing.Point(400, 128)
$browseBtn.Size     = New-Object System.Drawing.Size(90, 28)
$browseBtn.Add_Click({
    $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
    $dlg.Description = "Select install folder"
    $dlg.SelectedPath = $dirBox.Text
    if ($dlg.ShowDialog() -eq "OK") { $dirBox.Text = $dlg.SelectedPath }
})
$form.Controls.Add($browseBtn)

# Checkboxes
$addPathCheck = New-Object System.Windows.Forms.CheckBox
$addPathCheck.Text     = "Add Ezra to PATH (recommended)"
$addPathCheck.Font     = New-Object System.Drawing.Font("Segoe UI", 10)
$addPathCheck.Location = New-Object System.Drawing.Point(20, 175)
$addPathCheck.Size     = New-Object System.Drawing.Size(460, 25)
$addPathCheck.Checked  = $true
$form.Controls.Add($addPathCheck)

$vsCodeCheck = New-Object System.Windows.Forms.CheckBox
$vsCodeCheck.Text     = "Download VS Code extension (.vsix) for syntax highlighting"
$vsCodeCheck.Font     = New-Object System.Drawing.Font("Segoe UI", 10)
$vsCodeCheck.Location = New-Object System.Drawing.Point(20, 205)
$vsCodeCheck.Size     = New-Object System.Drawing.Size(460, 25)
$vsCodeCheck.Checked  = $true
$form.Controls.Add($vsCodeCheck)

# Progress
$progressLabel = New-Object System.Windows.Forms.Label
$progressLabel.Text     = "Ready to install."
$progressLabel.Font     = New-Object System.Drawing.Font("Segoe UI", 9)
$progressLabel.Location = New-Object System.Drawing.Point(20, 255)
$progressLabel.Size     = New-Object System.Drawing.Size(460, 20)
$form.Controls.Add($progressLabel)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(20, 278)
$progressBar.Size     = New-Object System.Drawing.Size(460, 22)
$progressBar.Minimum  = 0
$progressBar.Maximum  = 100
$progressBar.Value    = 0
$form.Controls.Add($progressBar)

# Log box
$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline   = $true
$logBox.ScrollBars  = "Vertical"
$logBox.ReadOnly    = $true
$logBox.Font        = New-Object System.Drawing.Font("Consolas", 8)
$logBox.Location    = New-Object System.Drawing.Point(20, 308)
$logBox.Size        = New-Object System.Drawing.Size(460, 80)
$logBox.BackColor   = [System.Drawing.Color]::FromArgb(240, 240, 245)
$form.Controls.Add($logBox)

function Log($msg) {
    $logBox.AppendText("$msg`r`n")
    $logBox.ScrollToCaret()
    $progressLabel.Text = $msg
    $form.Refresh()
}

# Buttons
$installBtn = New-Object System.Windows.Forms.Button
$installBtn.Text      = "Install"
$installBtn.Font      = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$installBtn.BackColor = [System.Drawing.Color]::FromArgb(30, 10, 60)
$installBtn.ForeColor = [System.Drawing.Color]::White
$installBtn.FlatStyle = "Flat"
$installBtn.Location  = New-Object System.Drawing.Point(310, 403)
$installBtn.Size      = New-Object System.Drawing.Size(100, 35)
$form.Controls.Add($installBtn)

$cancelBtn = New-Object System.Windows.Forms.Button
$cancelBtn.Text      = "Cancel"
$cancelBtn.Font      = New-Object System.Drawing.Font("Segoe UI", 10)
$cancelBtn.Location  = New-Object System.Drawing.Point(420, 403)
$cancelBtn.Size      = New-Object System.Drawing.Size(80, 35)
$cancelBtn.Add_Click({ $form.Close() })
$form.Controls.Add($cancelBtn)

# Install logic
$installBtn.Add_Click({
    $installBtn.Enabled = $false
    $cancelBtn.Enabled  = $false
    $installDir = $dirBox.Text.TrimEnd("\")
    $binDir     = Join-Path $installDir "bin"
    $ProgressPreference = "SilentlyContinue"

    try {
        # Step 1: Fetch release
        Log("Fetching release info from GitHub...")
        $progressBar.Value = 5
        $rel = Invoke-RestMethod "https://api.github.com/repos/$REPO/releases/tags/v$VERSION" `
            -Headers @{"User-Agent"="ezra-installer/$VERSION"}
        $zipAsset  = $rel.assets | Where-Object { $_.name -eq $ASSET_NAME }
        $vsixAsset = $rel.assets | Where-Object { $_.name -like "*.vsix" } | Select-Object -First 1
        if (-not $zipAsset) { throw "Release asset not found on GitHub." }

        # Step 2: Download zip
        $sizeMB = [math]::Round($zipAsset.size / 1MB, 1)
        Log("Downloading Ezra $VERSION ($sizeMB MB)...")
        $progressBar.Value = 20
        $tmp = Join-Path ([IO.Path]::GetTempPath()) "ezra-setup-$([System.Guid]::NewGuid().ToString('N').Substring(0,6))"
        New-Item -ItemType Directory -Force -Path $tmp | Out-Null
        $zipPath = Join-Path $tmp $ASSET_NAME
        Invoke-WebRequest $zipAsset.browser_download_url -OutFile $zipPath
        $progressBar.Value = 50

        # Step 3: Extract
        Log("Extracting files...")
        Expand-Archive $zipPath -DestinationPath $tmp -Force
        $progressBar.Value = 65

        # Step 4: Install
        Log("Installing to $binDir...")
        New-Item -ItemType Directory -Force -Path $binDir | Out-Null
        Copy-Item (Join-Path $tmp "ezra.exe")     (Join-Path $binDir "ezra.exe")     -Force
        Copy-Item (Join-Path $tmp "ezra-lsp.exe") (Join-Path $binDir "ezra-lsp.exe") -Force -ErrorAction SilentlyContinue
        $stdSrc = Join-Path $tmp "std"
        $exSrc  = Join-Path $tmp "examples"
        if (Test-Path $stdSrc)  { Copy-Item $stdSrc  (Join-Path $installDir "std")      -Recurse -Force }
        if (Test-Path $exSrc)   { Copy-Item $exSrc   (Join-Path $installDir "examples") -Recurse -Force }
        $progressBar.Value = 80

        # Step 5: PATH
        if ($addPathCheck.Checked) {
            Log("Adding to PATH...")
            Add-ToPath $binDir
        }
        $progressBar.Value = 88

        # Step 6: Download VSIX if requested
        if ($vsCodeCheck.Checked -and $vsixAsset) {
            Log("Downloading VS Code extension...")
            $vsixPath = Join-Path $installDir "ezra-lang-$VERSION.vsix"
            Invoke-WebRequest $vsixAsset.browser_download_url -OutFile $vsixPath
            Log("VSIX saved: $vsixPath")
        }
        $progressBar.Value = 95

        # Step 7: Cleanup
        Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
        $progressBar.Value = 100

        # Verify
        $ezraExe = Join-Path $binDir "ezra.exe"
        $ver = & $ezraExe --version 2>&1
        Log("SUCCESS: $ver installed!")

        # Done dialog
        $msg = "Ezra $VERSION installed successfully!`r`n`r`n"
        $msg += "Location: $binDir`r`n`r`n"
        $msg += "Open a NEW terminal and run:`r`n"
        $msg += "  ezra --version`r`n"
        $msg += "  ezra new my_app`r`n`r`n"
        if ($vsCodeCheck.Checked -and $vsixAsset) {
            $msg += "VS Code extension saved to:`r`n$installDir\ezra-lang-$VERSION.vsix`r`n"
            $msg += "Install it: VS Code -> Extensions -> ... -> Install from VSIX`r`n`r`n"
        }
        $msg += "Docs: https://ranaji114.github.io/Flux-programming-lang"

        [System.Windows.Forms.MessageBox]::Show($msg, "Ezra Installed!",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
        $form.Close()

    } catch {
        Log("ERROR: $_")
        Show-Error "Installation failed:`r`n$_"
        $installBtn.Enabled = $true
        $cancelBtn.Enabled  = $true
        $progressBar.Value  = 0
    }
})

$form.ShowDialog() | Out-Null

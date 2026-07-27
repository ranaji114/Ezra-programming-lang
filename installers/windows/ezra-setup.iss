; Ezra Language — Inno Setup 6 installer script
; Author: Ankur Rana
; Build: iscc installers\windows\ezra-setup.iss
; Download Inno Setup: https://jrsoftware.org/isdl.php

#define AppName      "Ezra"
#define AppVersion   "1.0.0"
#define AppPublisher "Ankur Rana"
#define AppURL       "https://ranaji114.github.io/Ezra-programming-lang"
#define AppExe       "ezra.exe"
#define AppLspExe    "ezra-lsp.exe"
#define AppGUID      "{{B7C4A1D2-3E5F-4890-BCDE-F01234567890}"

[Setup]
AppId={#AppGUID}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/issues
AppUpdatesURL={#AppURL}/releases
DefaultDirName={autopf}\Ezra
DefaultGroupName={#AppName}
AllowNoIcons=yes
LicenseFile=..\..\LICENSE
OutputDir=output
OutputBaseFilename=ezra-windows-x86_64-1.0.0
SetupIconFile=..\..\vscode-extension\flux\icons\flux-icon.png
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequiredOverridesAllowed=dialog
ChangesEnvironment=yes
UninstallDisplayIcon={app}\{#AppExe}
VersionInfoVersion={#AppVersion}
VersionInfoCompany={#AppPublisher}
VersionInfoDescription=Ezra Language Installer
VersionInfoCopyright=Copyright (C) 2026 Ankur Rana
MinVersion=10.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "addtopath";   Description: "Add Ezra to PATH (recommended)";     GroupDescription: "Installation:"; Flags: checked
Name: "desktopicon"; Description: "Create a desktop shortcut for REPL";  GroupDescription: "Shortcuts:";    Flags: unchecked
Name: "fileassoc";   Description: "Associate .ez files with Ezra";       GroupDescription: "File types:";   Flags: checked

[Files]
; Main binaries
Source: "..\..\target\release\{#AppExe}";    DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\target\release\{#AppLspExe}"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

; VS Code extension VSIX
Source: "..\..\vscode-extension\flux\ezra-lang-1.0.0.vsix"; DestDir: "{app}\extras"; Flags: ignoreversion skipifsourcedoesntexist

; Examples
Source: "..\..\examples\*"; DestDir: "{app}\examples"; Flags: ignoreversion recursesubdirs

; Standard library
Source: "..\..\std\*"; DestDir: "{app}\std"; Flags: ignoreversion recursesubdirs

; Docs (markdown only — lightweight)
Source: "..\..\docs\*.md";           DestDir: "{app}\docs"; Flags: ignoreversion
Source: "..\..\docs\syntax\*.md";    DestDir: "{app}\docs\syntax"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\docs\stdlib\*.md";    DestDir: "{app}\docs\stdlib"; Flags: ignoreversion skipifsourcedoesntexist

; License and readme
Source: "..\..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\LICENSE";   DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Ezra REPL";       Filename: "{app}\{#AppExe}"; Parameters: "repl"; WorkingDir: "{userdocs}"; Comment: "Ezra interactive shell"
Name: "{group}\Ezra Examples";   Filename: "{app}\examples"
Name: "{group}\Ezra Docs";       Filename: "{app}\docs\index.md"
Name: "{group}\Uninstall Ezra";  Filename: "{uninstallexe}"
Name: "{autodesktop}\Ezra REPL"; Filename: "{app}\{#AppExe}"; Parameters: "repl"; Tasks: desktopicon; Comment: "Ezra interactive shell"

[Registry]
; .ez file association
Root: HKA; Subkey: "Software\Classes\.ez";                              ValueType: string; ValueName: ""; ValueData: "EzraScript";           Flags: uninsdeletevalue; Tasks: fileassoc
Root: HKA; Subkey: "Software\Classes\EzraScript";                       ValueType: string; ValueName: ""; ValueData: "Ezra Script";           Flags: uninsdeletekey;   Tasks: fileassoc
Root: HKA; Subkey: "Software\Classes\EzraScript\DefaultIcon";           ValueType: string; ValueName: ""; ValueData: "{app}\{#AppExe},0";     Flags: uninsdeletekey;   Tasks: fileassoc
Root: HKA; Subkey: "Software\Classes\EzraScript\shell\open\command";    ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExe}"" run ""%1"""; Flags: uninsdeletekey; Tasks: fileassoc
Root: HKA; Subkey: "Software\Classes\EzraScript\shell\check\command";   ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExe}"" check ""%1"""; Flags: uninsdeletekey; Tasks: fileassoc

[Code]
// PATH management helpers
const
  HKCU_ENV = 'Environment';

procedure AddToUserPath(Dir: string);
var
  Old, New: string;
begin
  if not RegQueryStringValue(HKCU, HKCU_ENV, 'Path', Old) then Old := '';
  if Pos(LowerCase(Dir), LowerCase(Old)) > 0 then Exit;
  if Old = '' then New := Dir else New := Old + ';' + Dir;
  RegWriteExpandStringValue(HKCU, HKCU_ENV, 'Path', New);
end;

procedure RemoveFromUserPath(Dir: string);
var
  Old, New: string;
  Parts: TArrayOfString;
  i: Integer;
begin
  if not RegQueryStringValue(HKCU, HKCU_ENV, 'Path', Old) then Exit;
  Parts := SplitString(Old, ';');
  New := '';
  for i := 0 to GetArrayLength(Parts) - 1 do
    if LowerCase(Trim(Parts[i])) <> LowerCase(Dir) then begin
      if New <> '' then New := New + ';';
      New := New + Parts[i];
    end;
  RegWriteExpandStringValue(HKCU, HKCU_ENV, 'Path', New);
end;

// Broadcast WM_SETTINGCHANGE so PATH takes effect without reboot
procedure BroadcastEnvironmentChange();
var
  Dummy: DWORD;
begin
  SendMessageTimeout(HWND_BROADCAST, WM_SETTINGCHANGE, 0, 'Environment',
    SMTO_ABORTIFHUNG, 2000, Dummy);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then begin
    if IsTaskSelected('addtopath') then begin
      AddToUserPath(ExpandConstant('{app}'));
      BroadcastEnvironmentChange();
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then begin
    RemoveFromUserPath(ExpandConstant('{app}'));
    BroadcastEnvironmentChange();
  end;
end;

// Verify installer after install
function NextButtonClick(CurPage: Integer): Boolean;
begin
  Result := True;
end;

[Run]
; Silent version check — verifies the binary works post-install
Filename: "{app}\{#AppExe}"; Parameters: "--version"; Flags: runhidden waituntilterminated; StatusMsg: "Verifying Ezra installation..."

; Offer to open REPL after install
Filename: "{app}\{#AppExe}"; Description: "Open Ezra REPL now"; Parameters: "repl"; Flags: postinstall skipifsilent shellexec nowait

[UninstallRun]
Filename: "{app}\{#AppExe}"; Parameters: "--version"; Flags: runhidden; RunOnceId: "VersionCheck"

[Messages]
WelcomeLabel2=This will install [name/ver] on your computer.%n%nCreated by Ankur Rana%nhttps://github.com/ranaji114%n%nClick Next to continue.

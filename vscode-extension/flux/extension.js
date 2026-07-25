/**
 * Ezra Language VS Code Extension
 * Author: Ankur Rana
 * Version: 1.0.0
 */

'use strict';

const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/** @type {vscode.OutputChannel} */
let outputChannel;

/** @type {import('vscode-languageclient').LanguageClient | null} */
let lspClient = null;

/** @type {import('child_process').ChildProcess | null} */
let runningProcess = null;

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  outputChannel = vscode.window.createOutputChannel('Ezra');
  context.subscriptions.push(outputChannel);

  // Try to start LSP
  activateLsp(context);

  // Run-on-save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === 'ezra') {
        const cfg = vscode.workspace.getConfiguration('ezra');
        if (cfg.get('runOnSave')) runFile(doc.uri);
      }
    })
  );

  // Register commands
  const cmds = [
    ['ezra.runFile', () => {
      const ed = vscode.window.activeTextEditor;
      if (ed?.document.languageId === 'ezra') runFile(ed.document.uri);
      else vscode.window.showWarningMessage('Open an .ez file first.');
    }],
    ['ezra.stopRun', () => {
      if (runningProcess) { runningProcess.kill(); runningProcess = null; }
    }],
    ['ezra.checkFile', () => {
      const ed = vscode.window.activeTextEditor;
      if (ed) ezraCmd(['check', ed.document.uri.fsPath], 'Check');
    }],
    ['ezra.lintFile', () => {
      const ed = vscode.window.activeTextEditor;
      if (ed) ezraCmd(['lint', ed.document.uri.fsPath], 'Lint');
    }],
    ['ezra.formatFile', () => {
      const ed = vscode.window.activeTextEditor;
      if (ed) ezraCmd(['fmt', ed.document.uri.fsPath], 'Format');
    }],
    ['ezra.openRepl', () => {
      const t = vscode.window.createTerminal('Ezra REPL');
      t.show();
      t.sendText(quote(getEzraPath()) + ' repl');
    }],
    ['ezra.newProject', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'New Ezra project name',
        placeHolder: 'my_ezra_app',
        validateInput: v => /^[a-zA-Z0-9_-]+$/.test(v) ? null : 'Only letters, numbers, _ and - allowed',
      });
      if (name) {
        const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
        ezraCmd(['new', name], 'New Project', cwd);
      }
    }],
  ];

  for (const [id, handler] of cmds) {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  }

  // Context key for stop-button visibility
  vscode.commands.executeCommand('setContext', 'ezra.running', false);

  console.log('Ezra extension activated — Created by Ankur Rana');
}

function deactivate() {
  lspClient?.stop();
  runningProcess?.kill();
}

// ---------------------------------------------------------------------------
// LSP Client
// ---------------------------------------------------------------------------

/** @param {vscode.ExtensionContext} context */
function activateLsp(context) {
  const cfg = vscode.workspace.getConfiguration('ezra');
  if (!cfg.get('lsp.enabled')) return;

  const lspBin = getLspPath();
  if (!lspBin || !fs.existsSync(lspBin)) {
    outputChannel.appendLine(`[LSP] ezra-lsp not found — diagnostics/hover/completions disabled.`);
    outputChannel.appendLine(`[LSP] Expected: ${lspBin || '<not resolved>'}`);
    return;
  }

  let LanguageClient;
  try {
    ({ LanguageClient } = require('vscode-languageclient/node'));
  } catch {
    outputChannel.appendLine('[LSP] vscode-languageclient not installed — run: npm install');
    return;
  }

  const serverOptions = {
    command: lspBin,
    args: [],
    options: { env: { ...process.env, RUST_LOG: 'error' } },
  };

  const traceLevel = cfg.get('lsp.trace') || 'off';
  const clientOptions = {
    documentSelector: [{ scheme: 'file', language: 'ezra' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.ez'),
    },
    traceOutputChannel: outputChannel,
    trace: { server: traceLevel },
  };

  lspClient = new LanguageClient('ezra-lsp', 'Ezra Language Server', serverOptions, clientOptions);
  lspClient.start();
  context.subscriptions.push(lspClient);
  outputChannel.appendLine(`[LSP] Started: ${lspBin}`);
}

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

function getEzraPath() {
  const cfg = vscode.workspace.getConfiguration('ezra');
  const explicit = String(cfg.get('executablePath') || '').trim();
  if (explicit && explicit !== 'ezra') return explicit;

  for (const c of installerCandidates()) {
    if (fs.existsSync(c)) return c;
  }
  return 'ezra';
}

function getLspPath() {
  const cfg = vscode.workspace.getConfiguration('ezra');
  const explicit = String(cfg.get('lsp.serverPath') || '').trim();
  if (explicit) return explicit;

  const ext = process.platform === 'win32' ? '.exe' : '';
  const base = path.dirname(getEzraPath());
  const candidates = [];
  if (base && base !== '.') candidates.push(path.join(base, `ezra-lsp${ext}`));
  candidates.push(`ezra-lsp${ext}`);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0] ?? null;
}

function installerCandidates() {
  if (process.platform === 'win32') {
    const lad = process.env.LOCALAPPDATA ?? '';
    const up  = process.env.USERPROFILE ?? '';
    return [
      path.join(lad, 'Ezra', 'bin', 'ezra.exe'),
      path.join(up, '.ezra', 'bin', 'ezra.exe'),
      path.join(up, '.local', 'bin', 'ezra.exe'),
    ];
  }
  const home = process.env.HOME ?? '';
  return [
    path.join(home, '.local', 'bin', 'ezra'),
    path.join(home, '.ezra', 'bin', 'ezra'),
  ];
}

function quote(cmd) {
  return /[\s"'&()]/.test(cmd) ? `"${cmd.replace(/"/g, '\\"')}"` : cmd;
}

// ---------------------------------------------------------------------------
// Run file
// ---------------------------------------------------------------------------

function runFile(uri) {
  if (runningProcess) {
    runningProcess.kill();
    runningProcess = null;
  }

  const file = uri.fsPath;
  outputChannel.show(true);
  outputChannel.appendLine(`\n▶  Running ${path.basename(file)}...\n`);
  vscode.commands.executeCommand('setContext', 'ezra.running', true);

  const child = spawn(getEzraPath(), ['run', file], { stdio: 'pipe' });
  runningProcess = child;

  child.stdout.on('data', d => outputChannel.append(d.toString()));
  child.stderr.on('data', d => outputChannel.append(d.toString()));
  child.on('error', err => {
    outputChannel.appendLine(`\n⚠  Could not start Ezra: ${err.message}`);
    outputChannel.appendLine(`   Configured path: ${getEzraPath()}`);
    outputChannel.appendLine(`   Install Ezra or set "ezra.executablePath" in settings.\n`);
    vscode.window.showErrorMessage(
      'Ezra executable not found.',
      'Open Settings'
    ).then(v => v && vscode.commands.executeCommand('workbench.action.openSettings', 'ezra.executablePath'));
    vscode.commands.executeCommand('setContext', 'ezra.running', false);
    runningProcess = null;
  });
  child.on('close', code => {
    const icon = code === 0 ? '✓' : '✗';
    outputChannel.appendLine(`\n${icon}  Exited (code ${code ?? '?'})\n`);
    vscode.commands.executeCommand('setContext', 'ezra.running', false);
    runningProcess = null;
  });
}

// ---------------------------------------------------------------------------
// Generic Ezra command (check, lint, fmt, new)
// ---------------------------------------------------------------------------

function ezraCmd(args, label, cwd) {
  outputChannel.show(true);
  outputChannel.appendLine(`\n●  Ezra ${label}...\n`);

  const opts = cwd ? { cwd } : {};
  const child = spawn(getEzraPath(), args, { stdio: 'pipe', ...opts });

  child.stdout.on('data', d => outputChannel.append(d.toString()));
  child.stderr.on('data', d => outputChannel.append(d.toString()));
  child.on('error', err => {
    outputChannel.appendLine(`\n⚠  ${err.message}\n`);
  });
  child.on('close', code => {
    outputChannel.appendLine(`\n(exit ${code ?? '?'})\n`);
  });
}

module.exports = { activate, deactivate };

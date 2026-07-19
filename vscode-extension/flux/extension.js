const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let outputChannel;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  outputChannel = vscode.window.createOutputChannel('Flux');
  context.subscriptions.push(outputChannel);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === 'flux') {
        const config = vscode.workspace.getConfiguration('flux');
        if (config.get('runOnSave')) {
          runFile(doc.uri);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flux.runFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'flux') {
        runFile(editor.document.uri);
      } else {
        vscode.window.showWarningMessage('Please open a .flux file first.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flux.checkFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        runFluxCommand(['check', editor.document.uri.fsPath], 'Syntax Check');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flux.lintFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        runFluxCommand(['lint', editor.document.uri.fsPath], 'Lint');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flux.formatFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        runFluxCommand(['fmt', editor.document.uri.fsPath], 'Format');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flux.openRepl', () => {
      const terminal = vscode.window.createTerminal('Flux REPL');
      terminal.show();
      terminal.sendText(`${quoteForTerminal(getFluxPath())} repl`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('flux.newProject', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        placeHolder: 'my_flux_app',
      });
      if (name) {
        const cwd = vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0].uri.fsPath
          : process.cwd();
        runFluxCommand(['new', name], 'New Project', cwd);
      }
    })
  );

  console.log('Flux extension activated.');
}

function deactivate() {}

function getFluxPath() {
  const config = vscode.workspace.getConfiguration('flux');
  const configuredPath = String(config.get('path') || '').trim();
  if (configuredPath && configuredPath !== 'flux') {
    return configuredPath;
  }

  for (const candidate of getInstallerCandidates()) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return 'flux';
}

function getInstallerCandidates() {
  const candidates = [];

  if (process.platform === 'win32') {
    if (process.env.LOCALAPPDATA) {
      candidates.push(path.join(process.env.LOCALAPPDATA, 'Flux', 'bin', 'flux.exe'));
    }
    if (process.env.USERPROFILE) {
      candidates.push(path.join(process.env.USERPROFILE, '.flux', 'bin', 'flux.exe'));
    }
    return candidates;
  }

  if (process.env.HOME) {
    candidates.push(path.join(process.env.HOME, '.local', 'bin', 'flux'));
    candidates.push(path.join(process.env.HOME, '.flux', 'bin', 'flux'));
  }

  return candidates;
}

function quoteForTerminal(command) {
  if (!/\s|["'&()]/.test(command)) {
    return command;
  }
  return `"${command.replace(/"/g, '\\"')}"`;
}

function spawnFlux(args, cwd) {
  const options = {};
  if (cwd) {
    options.cwd = cwd;
  }
  return spawn(getFluxPath(), args, options);
}

function showSpawnError(error) {
  outputChannel.appendLine('');
  outputChannel.appendLine(`Could not start Flux from: ${getFluxPath()}`);
  outputChannel.appendLine(`Reason: ${error.message}`);
  outputChannel.appendLine('');
  outputChannel.appendLine('Install Flux, restart VS Code, or set "Flux: Path" to the full executable path.');
  vscode.window.showErrorMessage('Flux executable was not found. Install Flux or update the Flux path setting.');
}

function runFile(uri) {
  const filePath = uri.fsPath;

  outputChannel.show(true);
  outputChannel.appendLine(`\n> Running ${path.basename(filePath)}...\n`);

  const child = spawnFlux(['run', filePath]);

  child.stdout.on('data', (data) => {
    outputChannel.append(data.toString());
  });

  child.stderr.on('data', (data) => {
    outputChannel.append(data.toString());
  });

  child.on('error', showSpawnError);

  child.on('close', (code) => {
    if (code === 0) {
      outputChannel.appendLine(`\nOK (exit code ${code})\n`);
    } else if (code !== null) {
      outputChannel.appendLine(`\nFailed (exit code ${code})\n`);
    }
  });
}

function runFluxCommand(args, label, cwd) {
  outputChannel.show(true);
  outputChannel.appendLine(`\n> Flux ${label}...\n`);

  const child = spawnFlux(args, cwd);

  child.stdout.on('data', (data) => {
    outputChannel.append(data.toString());
  });

  child.stderr.on('data', (data) => {
    outputChannel.append(data.toString());
  });

  child.on('error', showSpawnError);

  child.on('close', (code) => {
    if (code !== null) {
      outputChannel.appendLine(`\n(exit code ${code})\n`);
    }
  });
}

module.exports = {
  activate,
  deactivate,
};

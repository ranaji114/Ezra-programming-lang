use std::io;
use std::path::{Path, PathBuf};

use crate::formatter::collect_ezra_files;
use crate::parser;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Severity {
    Warning,
    Error,
}

#[derive(Debug, Clone)]
pub struct LintMessage {
    pub path: PathBuf,
    pub line: usize,
    pub column: usize,
    pub severity: Severity,
    pub message: String,
}

pub fn lint_path(path: &Path) -> io::Result<Vec<LintMessage>> {
    let files = collect_ezra_files(path)?;
    let mut messages = Vec::new();
    for file in files {
        let source = std::fs::read_to_string(&file)?;
        messages.extend(lint_source(&file, &source));
    }
    Ok(messages)
}

pub fn lint_source(path: &Path, source: &str) -> Vec<LintMessage> {
    let mut messages = Vec::new();

    for (index, line) in source.lines().enumerate() {
        let line_number = index + 1;

        if line.len() > 100 {
            messages.push(LintMessage {
                path: path.to_path_buf(),
                line: line_number,
                column: 101,
                severity: Severity::Warning,
                message: "line longer than 100 characters".to_string(),
            });
        }

        if line.ends_with(' ') || line.ends_with('\t') {
            messages.push(LintMessage {
                path: path.to_path_buf(),
                line: line_number,
                column: line.len(),
                severity: Severity::Warning,
                message: "trailing whitespace".to_string(),
            });
        }
    }

    if !source.ends_with('\n') {
        messages.push(LintMessage {
            path: path.to_path_buf(),
            line: source.lines().count().max(1),
            column: source.lines().last().map_or(1, |l| l.len() + 1),
            severity: Severity::Warning,
            message: "file should end with a newline".to_string(),
        });
    }

    if let Err(error) = parser::parse(source) {
        messages.push(LintMessage {
            path: path.to_path_buf(),
            line: error.line,
            column: error.column,
            severity: Severity::Error,
            message: error.message,
        });
    }

    messages
}

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub fn format_source(source: &str) -> String {
    let mut output = String::new();
    let mut blank_lines = 0usize;

    for raw_line in source.replace("\r\n", "\n").replace('\r', "\n").lines() {
        let line = raw_line.trim_end();

        if line.is_empty() {
            blank_lines += 1;
            if blank_lines <= 1 && !output.is_empty() {
                output.push('\n');
            }
            continue;
        }

        blank_lines = 0;
        output.push_str(line);
        output.push('\n');
    }

    if output.is_empty() {
        output.push('\n');
    }

    output
}

pub fn format_path(path: &Path, check: bool) -> io::Result<FormatSummary> {
    let files = collect_ezra_files(path)?;
    let mut changed = Vec::new();

    for file in &files {
        let original = fs::read_to_string(file)?;
        let formatted = format_source(&original);

        if formatted != original {
            changed.push(file.clone());
            if !check {
                fs::write(file, formatted)?;
            }
        }
    }

    Ok(FormatSummary {
        checked: files.len(),
        changed,
    })
}

#[derive(Debug, Clone)]
pub struct FormatSummary {
    pub checked: usize,
    pub changed: Vec<PathBuf>,
}

/// Collect all `.ez` files under `path` (recursively if a directory).
pub fn collect_ezra_files(path: &Path) -> io::Result<Vec<PathBuf>> {
    if path.is_file() {
        return Ok(if is_ezra_file(path) {
            vec![path.to_path_buf()]
        } else {
            Vec::new()
        });
    }

    if !path.is_dir() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("path `{}` does not exist", path.display()),
        ));
    }

    let mut files = Vec::new();
    collect_recursive(path, &mut files)?;
    files.sort();
    Ok(files)
}

/// Backward-compatible alias used by linter and test runner.
#[inline]
pub fn collect_flux_files(path: &Path) -> io::Result<Vec<PathBuf>> {
    collect_ezra_files(path)
}

fn collect_recursive(path: &Path, files: &mut Vec<PathBuf>) -> io::Result<()> {
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let p = entry.path();

        if p.is_dir() {
            // Skip hidden dirs, target, node_modules, .git
            let skip = p.file_name().is_some_and(|n| {
                let s = n.to_string_lossy();
                s == "target" || s == "node_modules" || s.starts_with('.')
            });
            if skip {
                continue;
            }
            collect_recursive(&p, files)?;
        } else if is_ezra_file(&p) {
            files.push(p);
        }
    }
    Ok(())
}

fn is_ezra_file(path: &Path) -> bool {
    path.extension()
        .is_some_and(|ext| ext.eq_ignore_ascii_case("ez"))
}

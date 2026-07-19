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
    let files = collect_flux_files(path)?;
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

pub fn collect_flux_files(path: &Path) -> io::Result<Vec<PathBuf>> {
    if path.is_file() {
        return Ok(if is_flux_file(path) {
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
    collect_flux_files_recursive(path, &mut files)?;
    files.sort();
    Ok(files)
}

fn collect_flux_files_recursive(path: &Path, files: &mut Vec<PathBuf>) -> io::Result<()> {
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            if path.file_name().is_some_and(|name| name == "target") {
                continue;
            }
            collect_flux_files_recursive(&path, files)?;
        } else if is_flux_file(&path) {
            files.push(path);
        }
    }

    Ok(())
}

fn is_flux_file(path: &Path) -> bool {
    path.extension()
        .is_some_and(|extension| extension.eq_ignore_ascii_case("flux"))
}

use std::env;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process;

use ezra::formatter;
use ezra::fullvm::FastVM;
use ezra::linter::{self, Severity};
use ezra::parser;

fn main() {
    if let Err(error) = run_cli() {
        eprintln!("{error}");
        process::exit(1);
    }
}

fn run_cli() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();

    match args.get(1).map(String::as_str) {
        Some("run") => {
            let path = args.get(2).map(String::as_str).unwrap_or("src/main.ez");
            let source = fs::read_to_string(path)?;
            let program = parser::parse(&source)?;
            let mut vm = FastVM::new();
            vm.compile_and_run(&program)?;
            Ok(())
        }
        Some("check") => {
            let path = args.get(2).map(String::as_str).unwrap_or("src/main.ez");
            check_file(path)?;
            Ok(())
        }
        Some("test") => {
            let path = args.get(2).map(String::as_str).unwrap_or("tests");
            run_tests(path)?;
            Ok(())
        }
        Some("fmt") => {
            let check = args.iter().any(|arg| arg == "--check");
            let path = args
                .iter()
                .skip(2)
                .find(|arg| !arg.starts_with('-'))
                .map(String::as_str)
                .unwrap_or(".");
            format_files(path, check)?;
            Ok(())
        }
        Some("lint") => {
            let path = args.get(2).map(String::as_str).unwrap_or(".");
            lint_files(path)?;
            Ok(())
        }
        Some("build") => {
            let path = args.get(2).map(String::as_str).unwrap_or(".");
            build_project(path)?;
            Ok(())
        }
        Some("repl") => run_repl(),
        Some("new") => {
            let Some(name) = args.get(2) else {
                return Err("usage: ezra new <project-name>".into());
            };
            create_project(name)?;
            Ok(())
        }
        Some("--version") | Some("-V") => {
            println!("ezra 1.0.0");
            Ok(())
        }
        Some("--help") | Some("-h") | None => {
            print_help();
            Ok(())
        }
        Some(command) => Err(format!("unknown command `{command}`").into()),
    }
}

fn print_help() {
    println!("Ezra 1.0.0 — a readable scripting language");
    println!();
    println!("Usage:");
    println!("  ezra new <project-name>");
    println!("  ezra run [file.ez]");
    println!("  ezra check [file.ez]");
    println!("  ezra test [tests-dir-or-file]");
    println!("  ezra fmt [path] [--check]");
    println!("  ezra lint [path]");
    println!("  ezra build [project-dir]");
    println!("  ezra repl");
    println!("  ezra --version");
}

fn check_file(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let source = fs::read_to_string(path)?;
    parser::parse(&source)?;
    println!("Checked {path}");
    Ok(())
}

fn run_tests(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let test_files = collect_test_files(Path::new(path))?;
    if test_files.is_empty() {
        return Err(format!("no .ez tests found in `{path}`").into());
    }

    let total = test_files.len();
    for file in &test_files {
        let source = fs::read_to_string(file)?;
        let program = parser::parse(&source)?;
        let mut vm = FastVM::new();
        vm.compile_and_run(&program)?;
        println!("test {} ... ok", file.display());
    }

    println!("{total} Ezra test(s) passed");
    Ok(())
}

fn format_files(path: &str, check: bool) -> Result<(), Box<dyn std::error::Error>> {
    let summary = formatter::format_path(Path::new(path), check)?;

    if check && !summary.changed.is_empty() {
        for file in &summary.changed {
            println!("needs formatting: {}", file.display());
        }
        return Err(format!("{} file(s) need formatting", summary.changed.len()).into());
    }

    if check {
        println!("Checked {} Ezra file(s)", summary.checked);
    } else {
        println!(
            "Formatted {} Ezra file(s), changed {}",
            summary.checked,
            summary.changed.len()
        );
    }

    Ok(())
}

fn lint_files(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let messages = linter::lint_path(Path::new(path))?;
    let mut errors = 0usize;
    let mut warnings = 0usize;

    for message in &messages {
        match message.severity {
            Severity::Error => errors += 1,
            Severity::Warning => warnings += 1,
        }
        println!(
            "{}:{}:{}: {:?}: {}",
            message.path.display(),
            message.line,
            message.column,
            message.severity,
            message.message
        );
    }

    println!("{errors} error(s), {warnings} warning(s)");
    if errors > 0 {
        return Err("lint failed".into());
    }
    Ok(())
}

fn build_project(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let root = Path::new(path);
    let main_file = root.join("src").join("main.ez");

    if !main_file.is_file() {
        return Err(format!("expected `{}`", main_file.display()).into());
    }

    check_file(
        main_file
            .to_str()
            .ok_or("project path contains invalid UTF-8")?,
    )?;

    let build_dir = root.join("build");
    fs::create_dir_all(&build_dir)?;
    fs::write(
        build_dir.join("manifest.txt"),
        format!(
            "Ezra build\nproject={}\nentry={}\nversion=1.0.0\n",
            root.display(),
            main_file.display()
        ),
    )?;

    println!("Built project at {}", root.display());
    println!(
        "Artifact manifest: {}",
        build_dir.join("manifest.txt").display()
    );
    Ok(())
}

fn run_repl() -> Result<(), Box<dyn std::error::Error>> {
    println!("Ezra REPL 1.0.0");
    println!("Type `exit` or press Ctrl+C to quit.");

    let stdin = io::stdin();
    let mut vm = FastVM::new();

    loop {
        print!("ezra> ");
        io::stdout().flush()?;

        let mut line = String::new();
        if stdin.read_line(&mut line)? == 0 {
            println!();
            return Ok(());
        }

        let trimmed = line.trim();
        if trimmed == "exit" || trimmed == "quit" {
            return Ok(());
        }
        if trimmed.is_empty() {
            continue;
        }

        match parser::parse(&line).and_then(|program| vm.compile_and_run(&program)) {
            Ok(()) => {}
            Err(err) => eprintln!("{err}"),
        }
    }
}

fn collect_test_files(path: &Path) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
    let all = formatter::collect_ezra_files(path)?;
    if path.is_dir() {
        Ok(all
            .into_iter()
            .filter(|p| {
                p.file_stem()
                    .and_then(|s| s.to_str())
                    .map(|s| s.ends_with("_test"))
                    .unwrap_or(false)
            })
            .collect())
    } else {
        Ok(all)
    }
}

fn create_project(name: &str) -> Result<(), Box<dyn std::error::Error>> {
    validate_project_name(name)?;

    let root = Path::new(name);
    if root.exists() {
        return Err(format!("project `{name}` already exists").into());
    }

    fs::create_dir_all(root.join("src"))?;
    fs::create_dir_all(root.join("tests"))?;

    fs::write(
        root.join("ezra.toml"),
        format!(
            "[package]\nname = \"{name}\"\nversion = \"1.0.0\"\nedition = \"2025\"\n\n[dependencies]\n"
        ),
    )?;

    fs::write(
        root.join("src").join("main.ez"),
        "say \"Hello from Ezra!\"\n",
    )?;

    fs::write(
        root.join("tests").join("main_test.ez"),
        "say \"Tests coming soon\"\n",
    )?;

    println!("Created Ezra project `{name}`");
    println!("Next:");
    println!("  cd {name}");
    println!("  ezra run");

    Ok(())
}

fn validate_project_name(name: &str) -> Result<(), Box<dyn std::error::Error>> {
    if name.is_empty() {
        return Err("project name cannot be empty".into());
    }
    let valid = name
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_');
    if !valid {
        return Err("project name can only contain letters, numbers, `-`, and `_`".into());
    }
    Ok(())
}

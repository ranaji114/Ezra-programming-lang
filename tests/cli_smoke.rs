use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

fn flux_command() -> Command {
    let mut command = Command::new(env!("CARGO_BIN_EXE_flux"));
    command.current_dir(env!("CARGO_MANIFEST_DIR"));
    command
}

#[test]
fn runs_hello_example() {
    let output = flux_command()
        .args(["run", "examples/hello.flux"])
        .output()
        .expect("example should run");

    assert!(output.status.success());
    assert_eq!(String::from_utf8_lossy(&output.stdout), "Hello Flux\n");
}

#[test]
fn runs_non_interactive_examples() {
    for example in [
        "examples/basics.flux",
        "examples/collections.flux",
        "examples/functions.flux",
    ] {
        let output = flux_command()
            .args(["run", example])
            .output()
            .unwrap_or_else(|error| panic!("{example} should run: {error}"));

        assert!(
            output.status.success(),
            "{example} failed with stderr:\n{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert!(
            !output.stdout.is_empty(),
            "{example} should produce stdout output"
        );
    }
}

#[test]
fn runs_input_example_with_stdin() {
    let mut child = flux_command()
        .args(["run", "examples/input.flux"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("input example should start");

    child
        .stdin
        .as_mut()
        .expect("stdin should be piped")
        .write_all(b"Rana\n21\n")
        .expect("stdin should be written");

    let output = child
        .wait_with_output()
        .expect("input example should finish");
    let stdout = String::from_utf8_lossy(&output.stdout);

    assert!(output.status.success());
    assert!(stdout.contains("Hello Rana"));
    assert!(stdout.contains("Adult"));
}

#[test]
fn routes_diagnostics_to_stderr() {
    let output = flux_command()
        .args(["run", "examples/io.flux"])
        .output()
        .expect("io example should run");

    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(output.status.success());
    assert!(stderr.contains("warning: This goes to stderr as a warning"));
    assert!(stderr.contains("error: This goes to stderr as an error message"));
    assert!(stderr.contains("debug: Debug output is available"));
}

#[test]
fn checks_flux_file_without_running_it() {
    let output = flux_command()
        .args(["check", "examples/hello.flux"])
        .output()
        .expect("check should run");

    let stdout = String::from_utf8_lossy(&output.stdout);

    assert!(output.status.success());
    assert!(stdout.contains("Checked examples/hello.flux"));
}

#[test]
fn creates_and_tests_project() {
    let temp_root = unique_temp_dir();
    std::fs::create_dir_all(&temp_root).expect("temp root should be created");

    let new_output = Command::new(env!("CARGO_BIN_EXE_flux"))
        .current_dir(&temp_root)
        .args(["new", "sample_app"])
        .output()
        .expect("new command should run");
    assert!(
        new_output.status.success(),
        "new command failed with stderr:\n{}",
        String::from_utf8_lossy(&new_output.stderr)
    );

    let app_root = temp_root.join("sample_app");
    assert!(app_root.join("flux.toml").is_file());
    assert!(app_root.join("src/main.flux").is_file());
    assert!(app_root.join("tests/main_test.flux").is_file());

    let check_output = Command::new(env!("CARGO_BIN_EXE_flux"))
        .current_dir(&app_root)
        .arg("check")
        .output()
        .expect("check command should run");
    assert!(check_output.status.success());

    let test_output = Command::new(env!("CARGO_BIN_EXE_flux"))
        .current_dir(&app_root)
        .arg("test")
        .output()
        .expect("test command should run");
    assert!(
        test_output.status.success(),
        "test command failed with stderr:\n{}",
        String::from_utf8_lossy(&test_output.stderr)
    );
    assert!(String::from_utf8_lossy(&test_output.stdout).contains("1 Flux test(s) passed"));

    let build_output = Command::new(env!("CARGO_BIN_EXE_flux"))
        .current_dir(&app_root)
        .arg("build")
        .output()
        .expect("build command should run");
    assert!(
        build_output.status.success(),
        "build command failed with stderr:\n{}",
        String::from_utf8_lossy(&build_output.stderr)
    );
    assert!(app_root.join("build/manifest.txt").is_file());

    std::fs::remove_dir_all(&temp_root).expect("temp root should be removed");
}

#[test]
fn formats_and_lints_flux_files() {
    let temp_root = unique_temp_dir();
    std::fs::create_dir_all(&temp_root).expect("temp root should be created");
    let source_file = temp_root.join("main.flux");
    std::fs::write(&source_file, "say \"one\"   \n\n\nsay \"two\"").expect("source should write");

    let check_before = Command::new(env!("CARGO_BIN_EXE_flux"))
        .args(["fmt", source_file.to_str().unwrap(), "--check"])
        .output()
        .expect("fmt check should run");
    assert!(!check_before.status.success());

    let fmt_output = Command::new(env!("CARGO_BIN_EXE_flux"))
        .args(["fmt", source_file.to_str().unwrap()])
        .output()
        .expect("fmt should run");
    assert!(fmt_output.status.success());

    let check_after = Command::new(env!("CARGO_BIN_EXE_flux"))
        .args(["fmt", source_file.to_str().unwrap(), "--check"])
        .output()
        .expect("fmt check should run");
    assert!(check_after.status.success());

    let lint_output = Command::new(env!("CARGO_BIN_EXE_flux"))
        .args(["lint", source_file.to_str().unwrap()])
        .output()
        .expect("lint should run");
    assert!(lint_output.status.success());

    std::fs::remove_dir_all(&temp_root).expect("temp root should be removed");
}

#[test]
fn repl_exits_cleanly() {
    let mut child = flux_command()
        .arg("repl")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("repl should start");

    child
        .stdin
        .as_mut()
        .expect("stdin should be piped")
        .write_all(b"exit\n")
        .expect("stdin should be written");

    let output = child.wait_with_output().expect("repl should finish");
    assert!(output.status.success());
    assert!(String::from_utf8_lossy(&output.stdout).contains("Flux REPL"));
}

fn unique_temp_dir() -> PathBuf {
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("system time should be after Unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!(
        "flux_cli_smoke_{}_{}_{}",
        std::process::id(),
        std::thread::current().name().unwrap_or("test"),
        nanos
    ))
}

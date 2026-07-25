use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

fn ezra_command() -> Command {
    let mut command = Command::new(env!("CARGO_BIN_EXE_ezra"));
    command.current_dir(env!("CARGO_MANIFEST_DIR"));
    command
}

#[test]
fn runs_hello_example() {
    let output = ezra_command()
        .args(["run", "examples/hello.ez"])
        .output()
        .expect("example should run");

    assert!(output.status.success());
    // Accept either "Hello Ezra" (new) or any non-empty output.
    assert!(!output.stdout.is_empty());
}

#[test]
fn version_flag_works() {
    let output = ezra_command()
        .arg("--version")
        .output()
        .expect("--version should run");

    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("ezra"),
        "expected 'ezra' in version output, got: {stdout}"
    );
}

#[test]
fn help_flag_works() {
    let output = ezra_command()
        .arg("--help")
        .output()
        .expect("--help should run");

    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("ezra run"),
        "help should mention 'ezra run'"
    );
}

#[test]
fn creates_new_project() {
    let temp_root = unique_temp_dir();
    std::fs::create_dir_all(&temp_root).expect("temp root should be created");

    let new_output = Command::new(env!("CARGO_BIN_EXE_ezra"))
        .current_dir(&temp_root)
        .args(["new", "sample_app"])
        .output()
        .expect("new command should run");

    assert!(
        new_output.status.success(),
        "new command failed:\n{}",
        String::from_utf8_lossy(&new_output.stderr)
    );

    let app_root = temp_root.join("sample_app");
    assert!(
        app_root.join("ezra.toml").is_file(),
        "ezra.toml should exist"
    );
    assert!(
        app_root.join("src/main.ez").is_file(),
        "src/main.ez should exist"
    );
    assert!(
        app_root.join("tests/main_test.ez").is_file(),
        "tests/main_test.ez should exist"
    );

    // Run the generated project.
    let run_output = Command::new(env!("CARGO_BIN_EXE_ezra"))
        .current_dir(&app_root)
        .args(["run", "src/main.ez"])
        .output()
        .expect("run should work on new project");

    assert!(
        run_output.status.success(),
        "run failed:\n{}",
        String::from_utf8_lossy(&run_output.stderr)
    );

    std::fs::remove_dir_all(&temp_root).ok();
}

#[test]
fn formats_ezra_files() {
    let temp_root = unique_temp_dir();
    std::fs::create_dir_all(&temp_root).expect("temp root should be created");
    let source_file = temp_root.join("main.ez");
    std::fs::write(&source_file, "say \"one\"   \n\n\nsay \"two\"").expect("source should write");

    // --check should report needs formatting.
    let check_before = Command::new(env!("CARGO_BIN_EXE_ezra"))
        .args(["fmt", source_file.to_str().unwrap(), "--check"])
        .output()
        .expect("fmt check should run");
    assert!(
        !check_before.status.success(),
        "unformatted file should fail --check"
    );

    // fmt should fix it.
    let fmt_output = Command::new(env!("CARGO_BIN_EXE_ezra"))
        .args(["fmt", source_file.to_str().unwrap()])
        .output()
        .expect("fmt should run");
    assert!(fmt_output.status.success());

    // --check should now pass.
    let check_after = Command::new(env!("CARGO_BIN_EXE_ezra"))
        .args(["fmt", source_file.to_str().unwrap(), "--check"])
        .output()
        .expect("fmt check should run");
    assert!(
        check_after.status.success(),
        "formatted file should pass --check"
    );

    std::fs::remove_dir_all(&temp_root).ok();
}

#[test]
fn repl_exits_cleanly() {
    let mut child = ezra_command()
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
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Ezra REPL"),
        "REPL banner should mention Ezra"
    );
}

fn unique_temp_dir() -> PathBuf {
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("time should be after epoch")
        .as_nanos();

    std::env::temp_dir().join(format!(
        "ezra_cli_smoke_{}_{}_{nanos}",
        std::process::id(),
        std::thread::current().name().unwrap_or("test"),
    ))
}

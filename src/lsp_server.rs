use std::sync::Arc;
use tokio::sync::RwLock;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, LspService, Server};

// ---------------------------------------------------------------------------
// Built-in hover documentation table
// Each entry: (name, signature, short description)
// ---------------------------------------------------------------------------
const BUILTIN_DOCS: &[(&str, &str, &str)] = &[
    // Output
    ("say",          "say expr",                        "Print *expr* followed by a newline to stdout."),
    ("write",        "write expr",                      "Print *expr* without a trailing newline."),
    ("warn",         "warn expr",                       "Print `warning: expr` to stderr."),
    ("fail",         "fail expr",                       "Print `error: expr` to stderr."),
    ("debug",        "debug expr",                      "Print `debug: expr` to stderr."),
    ("clear",        "clear",                           "Send ANSI clear-screen sequence."),
    ("exit",         "exit(code: number)",              "Exit the program with the given numeric code."),
    // Input
    ("input",        "input(prompt: text) -> text",     "Display *prompt* and read a line of text from stdin."),
    ("input_number", "input_number(prompt: text) -> number", "Display *prompt*, read a line, and parse it as a number. Throws on invalid input."),
    // Types
    ("len",          "len(v: text|list|object) -> number", "Return the character count, item count, or field count."),
    ("type_of",      "type_of(v) -> text",              "Return the type name: `\"number\"`, `\"text\"`, `\"bool\"`, `\"nothing\"`, `\"list\"`, `\"object\"`, or `\"function\"`."),
    ("text",         "text(v) -> text",                 "Convert any value to its text representation."),
    ("number",       "number(v) -> number",             "Convert a value to a number. Returns `nothing` when conversion fails."),
    ("bool",         "bool(v) -> bool",                 "Return `yes` if *v* is truthy, otherwise `no`."),
    ("size_of",      "size_of(v) -> number",            "Return the size of *v*: character count for text, item count for lists, field count for objects."),
    // Math
    ("abs",          "abs(n: number) -> number",        "Absolute value."),
    ("sqrt",         "sqrt(n: number) -> number",       "Square root."),
    ("floor",        "floor(n: number) -> number",      "Round toward negative infinity."),
    ("ceil",         "ceil(n: number) -> number",       "Round toward positive infinity."),
    ("round",        "round(n: number) -> number",      "Round to nearest integer (half away from zero)."),
    ("min",          "min(a: number, b: number) -> number", "Return the smaller of two numbers."),
    ("max",          "max(a: number, b: number) -> number", "Return the larger of two numbers."),
    ("pow",          "pow(base: number, exp: number) -> number", "Return *base* raised to *exp*. Equivalent to `base ** exp`."),
    ("sin",          "sin(n: number) -> number",        "Sine (radians)."),
    ("cos",          "cos(n: number) -> number",        "Cosine (radians)."),
    ("tan",          "tan(n: number) -> number",        "Tangent (radians)."),
    ("log",          "log(n: number) -> number",        "Natural logarithm (base *e*)."),
    ("log10",        "log10(n: number) -> number",      "Base-10 logarithm."),
    ("exp",          "exp(n: number) -> number",        "e raised to the power *n*."),
    ("random",       "random() -> number",              "Random float in [0, 1)."),
    ("random_int",   "random_int(min: number, max: number) -> number", "Random integer in [min, max] inclusive."),
    // Collections
    ("range",        "range(n) | range(start, end) | range(start, end, step) -> list", "Create a list of numbers. `range(5)` → `[0,1,2,3,4]`."),
    ("keys",         "keys(obj: object) -> list",       "Return the sorted list of keys in *obj*."),
    ("values",       "values(obj: object) -> list",     "Return the list of values in *obj*."),
    ("has",          "has(obj: object, key: text) -> bool", "Return `yes` if *obj* contains *key*."),
    // File I/O
    ("read_file",    "read_file(path: text) -> text",   "Read the entire file at *path*. Returns `nothing` if not found."),
    ("write_file",   "write_file(path: text, content: text)", "Write *content* to *path*, creating or overwriting the file."),
    ("append_file",  "append_file(path: text, content: text)", "Append *content* to *path*."),
    ("file_exists",  "file_exists(path: text) -> bool", "Return `yes` if the file exists."),
    ("file_delete",  "file_delete(path: text)",         "Delete the file at *path*."),
    ("file_copy",    "file_copy(src: text, dst: text)", "Copy *src* to *dst*."),
    ("file_size",    "file_size(path: text) -> number", "Return file size in bytes."),
    ("list_dir",     "list_dir(path: text) -> list",    "Return a list of file names in the directory."),
    ("create_dir",   "create_dir(path: text)",          "Create a directory (and all parents)."),
    // JSON
    ("parse_json",   "parse_json(s: text) -> value",    "Parse a JSON string into an Ezra value."),
    ("stringify_json","stringify_json(v) -> text",      "Convert an Ezra value to a JSON string."),
    // OS
    ("cwd",          "cwd() -> text",                   "Return the current working directory path."),
    ("env",          "env(name: text) -> text",         "Return the environment variable value, or `nothing`."),
    ("args",         "args() -> list",                  "Return the command-line arguments as a list of text values."),
    ("sleep",        "sleep(ms: number)",               "Pause execution for *ms* milliseconds."),
    ("time",         "time() -> number",                "Return the current Unix timestamp in seconds."),
    ("date_now",     "date_now() -> object",            "Return an object with a `unix` field containing the current Unix timestamp."),
    // Type checks
    ("is_number",    "is_number(v) -> bool",            "Return `yes` if *v* is a number."),
    ("is_text",      "is_text(v) -> bool",              "Return `yes` if *v* is text."),
    ("is_bool",      "is_bool(v) -> bool",              "Return `yes` if *v* is a boolean."),
    ("is_list",      "is_list(v) -> bool",              "Return `yes` if *v* is a list."),
    ("is_object",    "is_object(v) -> bool",            "Return `yes` if *v* is an object."),
    ("is_function",  "is_function(v) -> bool",          "Return `yes` if *v* is a function."),
    ("is_nothing",   "is_nothing(v) -> bool",           "Return `yes` if *v* is `nothing`."),
];

/// Keyword documentation
const KEYWORD_DOCS: &[(&str, &str)] = &[
    ("check",     "**`check if condition`** — Conditional branch. Equivalent to Python's `if`."),
    ("otherwise", "**`otherwise`** — Default branch in a `check if` chain. Equivalent to `else`."),
    ("repeat",    "**`repeat N times`** — Repeat a block *N* times. *N* must be a non-negative integer."),
    ("for",       "**`for each item in list`** — Iterate over each item in a list."),
    ("give",      "**`give name(params)`** — Define a named function."),
    ("while",     "**`while condition`** — Loop while *condition* is truthy."),
    ("until",     "**`until condition`** — Do-while loop: body runs at least once, stops when *condition* is truthy."),
    ("loop",      "**`loop`** — Infinite loop. Use `break` to exit."),
    ("pick",      "**`pick value`** — Pattern match: compare *value* against `when` clauses."),
    ("try",       "**`try … catch err … finally`** — Error handling block."),
    ("throw",     "**`throw value`** — Throw a runtime error."),
    ("assert",    "**`assert condition, message`** — Throw if *condition* is falsy."),
    ("yes",       "**`yes`** — Boolean true. Equivalent to Python's `True`."),
    ("no",        "**`no`** — Boolean false. Equivalent to Python's `False`."),
    ("nothing",   "**`nothing`** — Null / nil value. Equivalent to Python's `None`."),
    ("and",       "**`x and y`** — Short-circuit logical AND. Right side is only evaluated when left is truthy."),
    ("or",        "**`x or y`** — Short-circuit logical OR. Right side is only evaluated when left is falsy."),
    ("not",       "**`not x`** — Logical negation. Returns `yes` if *x* is falsy."),
    ("is",        "**`x is y`** — Assignment (`name is value`) or equality test (`x is 42`)."),
    ("let",       "**`let name: type is value`** — Declare a mutable variable with optional type hint."),
    ("const",     "**`const NAME: type is value`** — Declare an immutable constant. Reassignment throws a runtime error."),
    ("use",       "**`use \"std/math\" as math`** — Import a module."),
    ("from",      "**`from \"std/math\" use sin, pi`** — Import specific names from a module."),
    ("return",    "**`return value`** — Return a value from a function."),
    ("break",     "**`break`** — Exit the nearest enclosing loop."),
    ("next",      "**`next`** — Skip to the next iteration of the nearest enclosing loop."),
];

fn builtin_hover(word: &str) -> Option<String> {
    for &(name, sig, desc) in BUILTIN_DOCS {
        if name == word {
            return Some(format!(
                "```ezra\n{sig}\n```\n\n{desc}\n\n---\n*Ezra built-in — by Ankur Rana*"
            ));
        }
    }
    for &(kw, doc) in KEYWORD_DOCS {
        if kw == word {
            return Some(format!("{doc}\n\n---\n*Ezra keyword — by Ankur Rana*"));
        }
    }
    None
}

/// Extract the word under the cursor from source text + position.
fn word_at(text: &str, line: u32, character: u32) -> Option<String> {
    let src_line = text.lines().nth(line as usize)?;
    let col = character as usize;
    if col > src_line.len() {
        return None;
    }
    let chars: Vec<char> = src_line.chars().collect();
    if col >= chars.len() {
        return None;
    }

    fn is_ident(c: char) -> bool {
        c.is_ascii_alphanumeric() || c == '_'
    }

    let mut start = col;
    while start > 0 && is_ident(chars[start - 1]) {
        start -= 1;
    }
    let mut end = col;
    while end < chars.len() && is_ident(chars[end]) {
        end += 1;
    }
    if start == end {
        return None;
    }
    Some(chars[start..end].iter().collect())
}

struct EzraLsp {
    client: Client,
    documents: Arc<RwLock<std::collections::HashMap<Url, String>>>,
}

impl EzraLsp {
    fn new(client: Client) -> Self {
        Self {
            client,
            documents: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    async fn publish_diagnostics(&self, uri: &Url, text: &str) {
        // Use Windows-style path on Windows (strip leading slash from URI path)
        #[cfg(windows)]
        let path_str = {
            let p = uri.path().trim_start_matches('/');
            let decoded = percent_decode(p);
            decoded
        };
        #[cfg(not(windows))]
        let path_str = uri.path();

        let diagnostics = ezra::linter::lint_source(std::path::Path::new(&path_str), text);
        let mut diags = Vec::new();
        for msg in &diagnostics {
            let line = msg.line.saturating_sub(1) as u32;
            let col = msg.column.saturating_sub(1) as u32;
            let range = Range {
                start: Position {
                    line,
                    character: col,
                },
                end: Position {
                    line,
                    character: col + 1,
                },
            };
            diags.push(Diagnostic {
                range,
                severity: Some(match msg.severity {
                    ezra::linter::Severity::Error => DiagnosticSeverity::ERROR,
                    ezra::linter::Severity::Warning => DiagnosticSeverity::WARNING,
                }),
                message: msg.message.clone(),
                source: Some("ezra-lsp".into()),
                ..Default::default()
            });
        }
        self.client
            .publish_diagnostics(uri.clone(), diags, None)
            .await;
    }
}

#[cfg(windows)]
fn percent_decode(s: &str) -> String {
    // Minimal URL percent-decode for path components
    let mut result = String::with_capacity(s.len());
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(hex) = std::str::from_utf8(&bytes[i + 1..i + 3]) {
                if let Ok(byte) = u8::from_str_radix(hex, 16) {
                    result.push(byte as char);
                    i += 3;
                    continue;
                }
            }
        }
        result.push(bytes[i] as char);
        i += 1;
    }
    result
}

#[tower_lsp::async_trait]
impl LanguageServer for EzraLsp {
    async fn initialize(
        &self,
        _: InitializeParams,
    ) -> tower_lsp::jsonrpc::Result<InitializeResult> {
        Ok(InitializeResult {
            server_info: Some(ServerInfo {
                name: "ezra-lsp".into(),
                version: Some("1.0.0".into()),
            }),
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::INCREMENTAL,
                )),
                completion_provider: Some(CompletionOptions {
                    trigger_characters: Some(vec![".".into(), ":".into(), "/".into()]),
                    ..Default::default()
                }),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                definition_provider: Some(OneOf::Left(true)),
                document_symbol_provider: Some(OneOf::Left(true)),
                ..Default::default()
            },
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client
            .log_message(MessageType::INFO, "ezra-lsp initialized")
            .await;
    }

    async fn shutdown(&self) -> tower_lsp::jsonrpc::Result<()> {
        Ok(())
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        let text = params.text_document.text;
        self.documents
            .write()
            .await
            .insert(uri.clone(), text.clone());
        self.publish_diagnostics(&uri, &text).await;
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        if let Some(change) = params.content_changes.into_iter().last() {
            let text = change.text;
            self.documents
                .write()
                .await
                .insert(uri.clone(), text.clone());
            self.publish_diagnostics(&uri, &text).await;
        }
    }

    async fn did_save(&self, params: DidSaveTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        if let Some(text) = self.documents.read().await.get(&uri).cloned() {
            self.publish_diagnostics(&uri, &text).await;
        }
    }

    async fn completion(
        &self,
        params: CompletionParams,
    ) -> tower_lsp::jsonrpc::Result<Option<CompletionResponse>> {
        let uri = params.text_document_position.text_document.uri;

        // Collect user-defined functions and variables from the open document
        let mut user_items: Vec<CompletionItem> = Vec::new();
        if let Some(text) = self.documents.read().await.get(&uri).cloned() {
            for line in text.lines() {
                let trimmed = line.trim_start();
                // User function: `give name(...)`
                if let Some(rest) = trimmed.strip_prefix("give ") {
                    if let Some(paren) = rest.find('(') {
                        let name = rest[..paren].trim().to_string();
                        if !name.is_empty() {
                            user_items.push(CompletionItem {
                                label: name.clone(),
                                detail: Some(format!("user function: {name}(…)")),
                                kind: Some(CompletionItemKind::FUNCTION),
                                insert_text: Some(format!("{name}($1)")),
                                insert_text_format: Some(InsertTextFormat::SNIPPET),
                                ..Default::default()
                            });
                        }
                    }
                }
                // Variable: `name is …`  or  `let name …`
                if let Some(rest) = trimmed.strip_prefix("let ") {
                    let var = rest
                        .split_whitespace()
                        .next()
                        .unwrap_or("")
                        .trim_end_matches(':');
                    if !var.is_empty() {
                        user_items.push(CompletionItem {
                            label: var.to_string(),
                            detail: Some("variable".into()),
                            kind: Some(CompletionItemKind::VARIABLE),
                            ..Default::default()
                        });
                    }
                } else if let Some(name) = trimmed.split(" is ").next() {
                    let name = name.trim();
                    if !name.is_empty()
                        && name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
                        && !matches!(
                            name,
                            "check" | "otherwise" | "repeat" | "for" | "while" | "until" | "loop"
                        )
                    {
                        user_items.push(CompletionItem {
                            label: name.to_string(),
                            detail: Some("variable".into()),
                            kind: Some(CompletionItemKind::VARIABLE),
                            ..Default::default()
                        });
                    }
                }
            }
        }

        // Macro to build a snippet CompletionItem
        macro_rules! snip {
            ($label:expr, $detail:expr, $snippet:expr, $kind:expr) => {
                CompletionItem {
                    label: $label.into(),
                    detail: Some($detail.into()),
                    insert_text: Some($snippet.into()),
                    insert_text_format: Some(InsertTextFormat::SNIPPET),
                    kind: Some($kind),
                    ..Default::default()
                }
            };
        }
        macro_rules! kw {
            ($label:expr, $detail:expr, $insert:expr) => {
                CompletionItem {
                    label: $label.into(),
                    detail: Some($detail.into()),
                    insert_text: Some($insert.into()),
                    insert_text_format: Some(InsertTextFormat::PLAIN_TEXT),
                    kind: Some(CompletionItemKind::KEYWORD),
                    ..Default::default()
                }
            };
        }
        macro_rules! builtin {
            ($label:expr, $detail:expr, $insert:expr) => {
                CompletionItem {
                    label: $label.into(),
                    detail: Some($detail.into()),
                    insert_text: Some($insert.into()),
                    insert_text_format: Some(InsertTextFormat::SNIPPET),
                    kind: Some(CompletionItemKind::FUNCTION),
                    ..Default::default()
                }
            };
        }

        let mut items: Vec<CompletionItem> = vec![
            // ── Control flow ───────────────────────────────────────────────
            snip!(
                "check if",
                "Conditional branch",
                "check if ${1:condition}\n  ${2:say \"yes\"}\notherwise\n  ${3:say \"no\"}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "otherwise if",
                "Else-if branch",
                "otherwise if ${1:condition}\n  $2",
                CompletionItemKind::KEYWORD
            ),
            kw!("otherwise", "Else branch", "otherwise\n  "),
            snip!(
                "repeat",
                "Repeat N times",
                "repeat ${1:3} times\n  $2",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "for each",
                "Iterate over list",
                "for each ${1:item} in ${2:items}\n  $3",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "while",
                "While loop",
                "while ${1:condition}\n  $2",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "until",
                "Do-while loop",
                "until ${1:condition}\n  $2",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "loop",
                "Infinite loop",
                "loop\n  $1\n  check if ${2:done}\n    break",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "pick",
                "Pattern match",
                "pick ${1:value}\n  when ${2:\"case1\"}\n    $3\n  otherwise\n    $4",
                CompletionItemKind::KEYWORD
            ),
            kw!("break", "Exit nearest loop", "break"),
            kw!("next", "Next iteration", "next"),
            kw!("return", "Return from function", "return "),
            // ── Functions ─────────────────────────────────────────────────
            snip!(
                "give",
                "Define a function",
                "give ${1:name}(${2:params})\n  -> ${3:value}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "lambda",
                "Arrow function",
                "${1:name} is ${2:n} -> ${3:n * 2}",
                CompletionItemKind::KEYWORD
            ),
            // ── Error handling ────────────────────────────────────────────
            snip!(
                "try",
                "Error handling",
                "try\n  $1\ncatch ${2:err}\n  say \"Error: {${2:err}}\"",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "try/finally",
                "Try with finally",
                "try\n  $1\ncatch ${2:err}\n  $3\nfinally\n  $4",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "throw",
                "Throw an error",
                "throw \"${1:message}\"",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "assert",
                "Assert condition",
                "assert ${1:condition}, \"${2:message}\"",
                CompletionItemKind::KEYWORD
            ),
            // ── Declarations ──────────────────────────────────────────────
            snip!(
                "let",
                "Mutable variable",
                "let ${1:name} is ${2:value}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "const",
                "Immutable constant",
                "const ${1:NAME} is ${2:42}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "struct",
                "Define struct",
                "struct ${1:Name}\n  ${2:field}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "enum",
                "Define enum",
                "enum ${1:Name}\n  ${2:Variant}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "impl",
                "Implement methods",
                "impl ${1:Name}\n  give ${2:method}(self)\n    $3",
                CompletionItemKind::KEYWORD
            ),
            // ── Modules ───────────────────────────────────────────────────
            snip!(
                "use",
                "Import module",
                "use \"${1:std/math}\" as ${2:math}",
                CompletionItemKind::KEYWORD
            ),
            snip!(
                "from",
                "Import names",
                "from \"${1:std/math}\" use ${2:sin, pi}",
                CompletionItemKind::KEYWORD
            ),
            // ── Constants ─────────────────────────────────────────────────
            CompletionItem {
                label: "yes".into(),
                detail: Some("Boolean true".into()),
                kind: Some(CompletionItemKind::CONSTANT),
                ..Default::default()
            },
            CompletionItem {
                label: "no".into(),
                detail: Some("Boolean false".into()),
                kind: Some(CompletionItemKind::CONSTANT),
                ..Default::default()
            },
            CompletionItem {
                label: "nothing".into(),
                detail: Some("Null value".into()),
                kind: Some(CompletionItemKind::CONSTANT),
                ..Default::default()
            },
            // ── Built-in output/input ─────────────────────────────────────
            builtin!("say", "say expr → stdout + newline", "say ${1:\"Hello!\"}"),
            builtin!(
                "write",
                "write expr → stdout no newline",
                "write ${1:\"text\"}"
            ),
            builtin!("warn", "warn expr → stderr", "warn ${1:\"message\"}"),
            builtin!("fail", "fail expr → stderr", "fail ${1:\"error\"}"),
            builtin!("debug", "debug expr → stderr", "debug ${1:value}"),
            builtin!("input", "input(prompt) → text", "input \"${1:prompt: }\""),
            builtin!(
                "input_number",
                "input_number(prompt) → number",
                "input_number \"${1:Enter number: }\""
            ),
            builtin!("exit", "exit(code)", "exit(${1:0})"),
            // ── Built-in type/len ─────────────────────────────────────────
            builtin!("len", "len(v) → number", "len(${1:value})"),
            builtin!("type_of", "type_of(v) → text", "type_of(${1:value})"),
            builtin!("text", "text(v) → text", "text(${1:value})"),
            builtin!("number", "number(v) → number", "number(${1:value})"),
            builtin!("bool", "bool(v) → bool", "bool(${1:value})"),
            // ── Math ──────────────────────────────────────────────────────
            builtin!("abs", "abs(n) → number", "abs(${1:n})"),
            builtin!("sqrt", "sqrt(n) → number", "sqrt(${1:n})"),
            builtin!("floor", "floor(n) → number", "floor(${1:n})"),
            builtin!("ceil", "ceil(n) → number", "ceil(${1:n})"),
            builtin!("round", "round(n) → number", "round(${1:n})"),
            builtin!("min", "min(a, b) → number", "min(${1:a}, ${2:b})"),
            builtin!("max", "max(a, b) → number", "max(${1:a}, ${2:b})"),
            builtin!("pow", "pow(base, exp) → number", "pow(${1:2}, ${2:8})"),
            builtin!("sin", "sin(n) → number (radians)", "sin(${1:n})"),
            builtin!("cos", "cos(n) → number (radians)", "cos(${1:n})"),
            builtin!("random", "random() → float [0,1)", "random()"),
            builtin!(
                "random_int",
                "random_int(min, max) → integer",
                "random_int(${1:1}, ${2:6})"
            ),
            // ── Collections ───────────────────────────────────────────────
            builtin!("range", "range(n) → list", "range(${1:10})"),
            builtin!("keys", "keys(obj) → list", "keys(${1:obj})"),
            builtin!("values", "values(obj) → list", "values(${1:obj})"),
            builtin!("has", "has(obj, key) → bool", "has(${1:obj}, \"${2:key}\")"),
            // ── File I/O ──────────────────────────────────────────────────
            builtin!(
                "read_file",
                "read_file(path) → text",
                "read_file(\"${1:file.txt}\")"
            ),
            builtin!(
                "write_file",
                "write_file(path, content)",
                "write_file(\"${1:file.txt}\", ${2:content})"
            ),
            builtin!(
                "append_file",
                "append_file(path, content)",
                "append_file(\"${1:file.txt}\", ${2:content})"
            ),
            builtin!(
                "file_exists",
                "file_exists(path) → bool",
                "file_exists(\"${1:file.txt}\")"
            ),
            builtin!(
                "file_delete",
                "file_delete(path)",
                "file_delete(\"${1:file.txt}\")"
            ),
            builtin!("list_dir", "list_dir(path) → list", "list_dir(\"${1:.}\")"),
            builtin!("create_dir", "create_dir(path)", "create_dir(\"${1:dir}\")"),
            // ── JSON ──────────────────────────────────────────────────────
            builtin!(
                "parse_json",
                "parse_json(s) → value",
                "parse_json(${1:json_string})"
            ),
            builtin!(
                "stringify_json",
                "stringify_json(v) → text",
                "stringify_json(${1:value})"
            ),
            // ── OS ────────────────────────────────────────────────────────
            builtin!("cwd", "cwd() → text", "cwd()"),
            builtin!("env", "env(name) → text", "env(\"${1:HOME}\")"),
            builtin!("sleep", "sleep(ms)", "sleep(${1:1000})"),
            builtin!("time", "time() → unix seconds", "time()"),
            builtin!("date_now", "date_now() → object", "date_now()"),
            // ── Type checks ───────────────────────────────────────────────
            builtin!("is_number", "is_number(v) → bool", "is_number(${1:v})"),
            builtin!("is_text", "is_text(v) → bool", "is_text(${1:v})"),
            builtin!("is_list", "is_list(v) → bool", "is_list(${1:v})"),
            builtin!("is_nothing", "is_nothing(v) → bool", "is_nothing(${1:v})"),
        ];

        // Deduplicate and append user symbols
        let existing_labels: std::collections::HashSet<String> =
            items.iter().map(|i| i.label.clone()).collect();
        for item in user_items {
            if !existing_labels.contains(&item.label) {
                items.push(item);
            }
        }

        Ok(Some(CompletionResponse::Array(items)))
    }

    async fn hover(&self, params: HoverParams) -> tower_lsp::jsonrpc::Result<Option<Hover>> {
        let uri = params.text_document_position_params.text_document.uri;
        let pos = params.text_document_position_params.position;

        if let Some(text) = self.documents.read().await.get(&uri).cloned() {
            if let Some(word) = word_at(&text, pos.line, pos.character) {
                if let Some(doc) = builtin_hover(&word) {
                    return Ok(Some(Hover {
                        contents: HoverContents::Markup(MarkupContent {
                            kind: MarkupKind::Markdown,
                            value: doc,
                        }),
                        range: None,
                    }));
                }

                // User-defined function hover: scan document for `give word(`
                let pattern = format!("give {word}(");
                for (line_no, line) in text.lines().enumerate() {
                    if line.contains(&pattern) {
                        let doc = format!(
                            "```ezra\n{}\n```\n\n*User-defined function — line {}*\n\n---\n*Ezra — by Ankur Rana*",
                            line.trim(),
                            line_no + 1
                        );
                        return Ok(Some(Hover {
                            contents: HoverContents::Markup(MarkupContent {
                                kind: MarkupKind::Markdown,
                                value: doc,
                            }),
                            range: None,
                        }));
                    }
                }
            }
        }
        Ok(None)
    }

    async fn goto_definition(
        &self,
        params: GotoDefinitionParams,
    ) -> tower_lsp::jsonrpc::Result<Option<GotoDefinitionResponse>> {
        let uri = params.text_document_position_params.text_document.uri;
        let pos = params.text_document_position_params.position;

        if let Some(text) = self.documents.read().await.get(&uri).cloned() {
            if let Some(word) = word_at(&text, pos.line, pos.character) {
                // Search for function definition: `give word(`
                let def_pattern = format!("give {word}(");
                // Also search for variable assignment: `^word is `
                let var_pattern = format!("{word} is ");

                for (line_no, line) in text.lines().enumerate() {
                    if line.contains(&def_pattern) || line.trim_start().starts_with(&var_pattern) {
                        let location = Location {
                            uri: uri.clone(),
                            range: Range {
                                start: Position {
                                    line: line_no as u32,
                                    character: 0,
                                },
                                end: Position {
                                    line: line_no as u32,
                                    character: line.len() as u32,
                                },
                            },
                        };
                        return Ok(Some(GotoDefinitionResponse::Scalar(location)));
                    }
                }
            }
        }
        Ok(None)
    }

    #[allow(deprecated)]
    async fn document_symbol(
        &self,
        params: DocumentSymbolParams,
    ) -> tower_lsp::jsonrpc::Result<Option<DocumentSymbolResponse>> {
        let uri = params.text_document.uri;
        if let Some(text) = self.documents.read().await.get(&uri).cloned() {
            if let Ok(program) = ezra::parser::parse(&text) {
                let mut symbols = Vec::new();
                for stmt in &program.statements {
                    match stmt {
                        ezra::ast::Stmt::Function { name, .. } => {
                            #[allow(deprecated)]
                            symbols.push(DocumentSymbol {
                                name: name.clone(),
                                kind: SymbolKind::FUNCTION,
                                range: Range::default(),
                                selection_range: Range::default(),
                                children: None,
                                detail: None,
                                tags: None,
                                deprecated: None,
                            });
                        }
                        ezra::ast::Stmt::Assign { name, .. }
                        | ezra::ast::Stmt::Let { name, .. } => {
                            #[allow(deprecated)]
                            symbols.push(DocumentSymbol {
                                name: name.clone(),
                                kind: SymbolKind::VARIABLE,
                                range: Range::default(),
                                selection_range: Range::default(),
                                children: None,
                                detail: None,
                                tags: None,
                                deprecated: None,
                            });
                        }
                        ezra::ast::Stmt::Struct { name, .. } => {
                            #[allow(deprecated)]
                            symbols.push(DocumentSymbol {
                                name: name.clone(),
                                kind: SymbolKind::STRUCT,
                                range: Range::default(),
                                selection_range: Range::default(),
                                children: None,
                                detail: None,
                                tags: None,
                                deprecated: None,
                            });
                        }
                        _ => {}
                    }
                }
                return Ok(Some(DocumentSymbolResponse::Nested(symbols)));
            }
        }
        Ok(None)
    }
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();
    let (service, socket) = LspService::new(EzraLsp::new);
    Server::new(stdin, stdout, socket).serve(service).await;
}

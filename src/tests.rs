#[cfg(test)]
mod tests {
    use crate::ast::{Expr, Stmt};
    use crate::formatter;
    use crate::interpreter::Interpreter;
    use crate::linter::{self, Severity};
    use crate::parser;
    use std::path::Path;

    fn run_source(source: &str) -> Result<(), crate::error::FluxError> {
        let program = parser::parse(source)?;
        let mut interpreter = Interpreter::new();
        interpreter.run(&program)
    }

    #[test]
    fn parses_say_statement() {
        let program = parser::parse("say \"Hello\"\n").expect("parse should succeed");
        assert_eq!(program.statements.len(), 1);
        assert!(matches!(program.statements[0], Stmt::Say(Expr::Text(_))));
    }

    #[test]
    fn ignores_utf8_bom_at_start_of_source() {
        let program =
            parser::parse("\u{feff}say \"Hello\"\n").expect("UTF-8 BOM should be ignored");
        assert_eq!(program.statements.len(), 1);
        assert!(matches!(program.statements[0], Stmt::Say(Expr::Text(_))));
    }

    #[test]
    fn parses_assignment() {
        let program = parser::parse("name is \"Rana\"\n").expect("parse should succeed");
        assert_eq!(program.statements.len(), 1);
        assert!(matches!(
            &program.statements[0],
            Stmt::Assign { name, .. } if name == "name"
        ));
    }

    #[test]
    fn parses_check_otherwise() {
        let source = "age is 20\ncheck if age >= 18\n  say \"Adult\"\notherwise\n  say \"Minor\"\n";
        let program = parser::parse(source).expect("parse should succeed");
        assert_eq!(program.statements.len(), 2);
        assert!(matches!(program.statements[1], Stmt::Check { .. }));
    }

    #[test]
    fn parses_otherwise_if_chain() {
        let source = "score is 75\ncheck if score >= 90\n  say \"A\"\notherwise if score >= 70\n  say \"B\"\notherwise\n  say \"C\"\n";
        let program = parser::parse(source).expect("parse should succeed");
        assert_eq!(program.statements.len(), 2);
        assert!(matches!(program.statements[1], Stmt::Check { .. }));
    }

    #[test]
    fn parses_comments_without_stripping_text_contents() {
        let source = r#"say "quote: \" # still text" # real comment"#;
        let program = parser::parse(source).expect("parse should succeed");
        assert_eq!(program.statements.len(), 1);
        assert!(matches!(program.statements[0], Stmt::Say(Expr::Text(_))));
    }

    #[test]
    fn rejects_tabs_in_indentation() {
        let source = "check if yes\n\tsay \"bad\"\n";
        let error = parser::parse(source).expect_err("tabs should be rejected");
        assert!(error.message.contains("tabs are not supported"));
        assert_eq!(error.line, 2);
        assert_eq!(error.column, 1);
    }

    #[test]
    fn runs_core_language_features() {
        let source = r#"
items is [1, 2, 3]
total is 0

for each item in items
  total += item

give add(a, b)
  -> a + b

result is add(total, 4)

check if result is 10
  result += 1
otherwise
  result is 0
"#;

        run_source(source).expect("program should run");
    }

    #[test]
    fn rejects_fractional_repeat_count() {
        let error = run_source("repeat 1.5 times\n  say \"bad\"\n")
            .expect_err("fractional repeat count should fail");
        assert!(error
            .message
            .contains("repeat count must be a non-negative integer"));
    }

    #[test]
    fn rejects_invalid_indexes() {
        let negative = run_source("value is [1, 2][-1]\n").expect_err("negative index should fail");
        assert!(negative
            .message
            .contains("list index must be a non-negative integer"));

        let fractional =
            run_source("value is \"abc\"[1.5]\n").expect_err("fractional index should fail");
        assert!(fractional
            .message
            .contains("text index must be a non-negative integer"));
    }

    #[test]
    fn rejects_remainder_by_zero() {
        let error = run_source("value is 10 % 0\n").expect_err("remainder by zero should fail");
        assert!(error.message.contains("remainder by zero"));
    }

    #[test]
    fn rejects_invalid_take_and_drop_counts() {
        let take =
            run_source("value is [1, 2, 3].take(-1)\n").expect_err("negative take should fail");
        assert!(take
            .message
            .contains("take count must be a non-negative integer"));

        let drop =
            run_source("value is [1, 2, 3].drop(1.5)\n").expect_err("fractional drop should fail");
        assert!(drop
            .message
            .contains("drop count must be a non-negative integer"));
    }

    #[test]
    fn formatter_normalizes_safe_whitespace() {
        let source = "say \"one\"   \n\n\nsay \"two\"\r\n";
        let formatted = formatter::format_source(source);
        assert_eq!(formatted, "say \"one\"\n\nsay \"two\"\n");
    }

    #[test]
    fn linter_reports_parser_errors() {
        let messages = linter::lint_source(Path::new("bad.flux"), "say \"unterminated\n");
        assert!(messages
            .iter()
            .any(|message| message.severity == Severity::Error));
    }
}

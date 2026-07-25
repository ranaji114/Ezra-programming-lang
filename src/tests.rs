#[cfg(test)]
mod tests {
    use crate::ast::{Expr, Stmt};
    use crate::formatter;
    use crate::fullvm::FastVM;
    use crate::linter::{self, Severity};
    use crate::parser;
    use std::path::Path;

    fn run_source(source: &str) -> Result<(), crate::error::EzraError> {
        let program = parser::parse(source)?;
        let mut vm = FastVM::new();
        vm.compile_and_run(&program)
    }

    #[test]
    fn parses_say_statement() {
        let program = parser::parse("say \"Hello\"\n").expect("parse should succeed");
        assert_eq!(program.statements.len(), 1);
        assert!(matches!(program.statements[0], Stmt::Say(Expr::Text(_))));
    }

    #[test]
    fn ignores_utf8_bom_at_start_of_source() {
        let program = parser::parse("\u{feff}say \"Hello\"\n").expect("BOM should be ignored");
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

check if total is 6
  total += 1
otherwise
  total is 0
"#;
        run_source(source).expect("program should run");
    }

    #[test]
    fn compound_assign_subtraction_is_correct() {
        // Previously x -= 3 computed 3 - x; verify it now computes x - 3.
        run_source("x is 10\nx -= 3\nassert x is 7, \"x -= 3 should give 7\"")
            .expect("x -= 3 should give 7");
    }

    #[test]
    fn compound_assign_division_is_correct() {
        run_source("x is 10\nx /= 2\nassert x is 5, \"x /= 2 should give 5\"")
            .expect("x /= 2 should give 5");
    }

    #[test]
    fn break_works_inside_loop() {
        let source = r#"
i is 0
loop
  i += 1
  check if i is 3
    break
assert i is 3, "loop should stop at 3"
"#;
        run_source(source).expect("break should work");
    }

    #[test]
    fn next_works_inside_loop() {
        // next inside `for each` should skip the rest of the body.
        let source = r#"
evens is []
for each n in [1, 2, 3, 4, 5]
  check if n % 2 is 1
    next
  evens is evens + [n]
assert len(evens) is 2, "should have 2 even numbers"
"#;
        run_source(source).expect("next should work");
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
    fn rejects_negative_list_index() {
        let error = run_source("value is [1, 2][-1]\n").expect_err("negative index should fail");
        assert!(error.message.contains("list index must be non-negative"));
    }

    #[test]
    fn rejects_fractional_text_index() {
        let error =
            run_source("value is \"abc\"[1.5]\n").expect_err("fractional index should fail");
        assert!(error.message.contains("text index must be integer"));
    }

    #[test]
    fn rejects_remainder_by_zero() {
        let error = run_source("value is 10 % 0\n").expect_err("remainder by zero should fail");
        assert!(error.message.contains("remainder by zero"));
    }

    #[test]
    fn write_statement_does_not_error() {
        // Previously `write` hit "unknown builtin"; verify it runs.
        run_source("write \"hello\"").expect("write should work");
    }

    #[test]
    fn warn_statement_does_not_error() {
        run_source("warn \"careful\"").expect("warn should work");
    }

    #[test]
    fn try_catch_works() {
        let source = r#"
caught is no
try
  throw "oops"
catch e
  caught is yes
assert caught, "catch should have run"
"#;
        run_source(source).expect("try/catch should work");
    }

    #[test]
    fn and_short_circuits() {
        // Right side must NOT be evaluated when left is falsy.
        // If it were evaluated, accessing `x.foo` on nothing would panic.
        let source = r#"
x is nothing
result is x is not nothing and x is 42
assert result is no, "short-circuit and should return no"
"#;
        run_source(source).expect("and should short-circuit");
    }

    #[test]
    fn or_short_circuits() {
        // Right side must NOT be evaluated when left is truthy.
        let source = r#"
result is yes or (1 / 0 > 0)
assert result, "short-circuit or should return yes without evaluating rhs"
"#;
        run_source(source).expect("or should short-circuit");
    }

    #[test]
    fn arity_mismatch_errors() {
        let source = r#"
give add(a, b)
  -> a + b
add(1)
"#;
        let err = run_source(source).expect_err("wrong arity should fail");
        assert!(
            err.message.contains("expected 2 argument"),
            "error message should mention expected arity, got: {}",
            err.message
        );
    }

    #[test]
    fn numeric_sort_is_correct() {
        run_source(
            "nums is [10, 2, 30, 5]\nnums is nums.sort()\nassert nums[0] is 2, \"first after sort should be 2\"",
        )
        .expect("numeric sort should work");
    }

    // -----------------------------------------------------------------------
    // Edge-case tests (Phase 2 / Phase 1 dynamic testing)
    // -----------------------------------------------------------------------

    #[test]
    fn edge_deep_recursion() {
        let source = r#"
give count_down(n)
  check if n is 0
    -> "done"
  -> count_down(n - 1)
result is count_down(400)
assert result is "done", "deep recursion should work"
"#;
        run_source(source).expect("deep recursion should not stack overflow at depth 400");
    }

    #[test]
    fn edge_large_list_operations() {
        let source = r#"
nums is range(1000)
assert len(nums) is 1000, "range(1000) should produce 1000 items"
sorted is nums.sort()
assert sorted[0] is 0, "smallest element should be 0"
assert sorted[999] is 999, "largest element should be 999"
"#;
        run_source(source).expect("large list ops should work");
    }

    #[test]
    fn edge_empty_string_is_falsy() {
        run_source(
            "empty is \"\"\nassert not empty, \"empty string must be falsy\"\nassert len(empty) is 0, \"empty string has length 0\"",
        )
        .expect("empty string edge case");
    }

    #[test]
    fn edge_type_coercion_addition() {
        // number + text → text concatenation
        run_source(
            "r is 1 + \"2\"\nassert r is \"12\", \"number + text should concatenate\"",
        )
        .expect("type coercion in addition");
    }

    #[test]
    fn edge_arrow_function_in_higher_order() {
        let source = r#"
nums is [1, 2, 3, 4, 5]
evens is nums.filter(n -> n % 2 is 0)
assert len(evens) is 2, "should have 2 even numbers"
assert evens[0] is 2, "first even should be 2"
doubled is evens.map(n -> n * 2)
assert doubled[0] is 4, "first doubled even should be 4"
assert doubled[1] is 8, "second doubled even should be 8"
"#;
        run_source(source).expect("arrow functions in higher-order calls should work");
    }

    #[test]
    fn edge_file_not_found_returns_nothing() {
        run_source(
            r#"content is read_file("definitely_does_not_exist_xyz_12345.txt")
assert content is nothing, "missing file should return nothing""#,
        )
        .expect("read_file on missing file should return nothing");
    }

    #[test]
    fn edge_zero_length_list() {
        run_source(
            r#"empty is []
assert len(empty) is 0
assert empty.is_empty()
assert empty.first() is nothing
result is empty.filter(x -> yes)
assert len(result) is 0"#,
        )
        .expect("zero-length list operations should work");
    }

    #[test]
    fn edge_nested_try_catch_rethrow() {
        run_source(
            r#"inner_caught is no
outer_caught is no
try
  try
    throw "inner"
  catch e1
    inner_caught is yes
    throw "outer " + e1
catch e2
  outer_caught is yes
assert inner_caught, "inner catch should have run"
assert outer_caught, "outer catch should have run""#,
        )
        .expect("nested try/catch with rethrow should work");
    }

    #[test]
    fn edge_const_reassign_throws() {
        let err = run_source("const X is 42\nX is 99")
            .expect_err("reassigning const should fail");
        assert!(
            err.message.contains("constant"),
            "error should mention constant, got: {}",
            err.message
        );
    }

    #[test]
    fn formatter_normalizes_safe_whitespace() {
        let source = "say \"one\"   \n\n\nsay \"two\"\r\n";
        let formatted = formatter::format_source(source);
        assert_eq!(formatted, "say \"one\"\n\nsay \"two\"\n");
    }

    #[test]
    fn linter_reports_parser_errors() {
        let messages = linter::lint_source(Path::new("bad.ez"), "say \"unterminated\n");
        assert!(messages.iter().any(|m| m.severity == Severity::Error));
    }
}

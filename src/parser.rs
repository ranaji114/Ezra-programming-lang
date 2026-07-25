use crate::ast::{BinaryOp, CompoundOp, Expr, Program, Stmt, UnaryOp};
use crate::error::EzraError as FluxError;
use crate::lexer::lex_expression;
use crate::token::{Token, TokenKind};

pub fn parse(source: &str) -> Result<Program, FluxError> {
    let lines = preprocess_lines(source)?;
    let mut parser = Parser { lines, current: 0 };
    let statements = parser.parse_block(0)?;
    Ok(Program { statements })
}

#[derive(Debug, Clone)]
struct SourceLine {
    indent: usize,
    text: String,
    line_number: usize,
}

struct Parser {
    lines: Vec<SourceLine>,
    current: usize,
}

impl Parser {
    fn parse_block(&mut self, indent: usize) -> Result<Vec<Stmt>, FluxError> {
        let mut statements = Vec::new();

        while let Some(line) = self.peek().cloned() {
            if line.indent < indent {
                break;
            }
            if line.indent > indent {
                return Err(FluxError::new(
                    format!("unexpected indentation; expected {indent} spaces"),
                    line.line_number,
                    line.indent + 1,
                ));
            }
            if line.text == "otherwise" || line.text.starts_with("otherwise if ") {
                break;
            }
            if line.text == "catch" || line.text.starts_with("catch ") || line.text == "finally" {
                break;
            }
            if line.text.starts_with("when ") {
                break;
            }

            statements.push(self.parse_statement(indent)?);
        }

        Ok(statements)
    }

    fn parse_statement(&mut self, indent: usize) -> Result<Stmt, FluxError> {
        let line = self.advance().clone();

        if let Some(rest) = line.text.strip_prefix("say ") {
            return Ok(Stmt::Say(parse_expr(
                rest,
                line.line_number,
                line.indent + 5,
            )?));
        }

        if let Some(rest) = line
            .text
            .strip_prefix("write ")
            .or_else(|| line.text.strip_prefix("print "))
        {
            return Ok(Stmt::Write(parse_expr(
                rest,
                line.line_number,
                line.indent + 7,
            )?));
        }

        if let Some(rest) = line.text.strip_prefix("warn ") {
            return Ok(Stmt::Warn(parse_expr(
                rest,
                line.line_number,
                line.indent + 6,
            )?));
        }

        if let Some(rest) = line
            .text
            .strip_prefix("fail ")
            .or_else(|| line.text.strip_prefix("error "))
        {
            return Ok(Stmt::Fail(parse_expr(
                rest,
                line.line_number,
                line.indent + 6,
            )?));
        }

        if let Some(rest) = line.text.strip_prefix("debug ") {
            return Ok(Stmt::Debug(parse_expr(
                rest,
                line.line_number,
                line.indent + 7,
            )?));
        }

        if line.text == "clear" {
            return Ok(Stmt::Clear);
        }

        if line.text == "break" {
            return Ok(Stmt::Break);
        }

        if line.text == "next" {
            return Ok(Stmt::Next);
        }

        if let Some(rest) = line
            .text
            .strip_prefix("return ")
            .or_else(|| line.text.strip_prefix("-> "))
        {
            return Ok(Stmt::Return(parse_expr(
                rest,
                line.line_number,
                line.indent + 4,
            )?));
        }

        if let Some(rest) = line.text.strip_prefix("exit ") {
            return Ok(Stmt::Exit(parse_expr(
                rest,
                line.line_number,
                line.indent + 6,
            )?));
        }

        if let Some(rest) = line
            .text
            .strip_prefix("exit(")
            .and_then(|text| text.strip_suffix(')'))
        {
            return Ok(Stmt::Exit(parse_expr(
                rest,
                line.line_number,
                line.indent + 6,
            )?));
        }

        if let Some(rest) = line.text.strip_prefix("check if ") {
            return self.parse_check(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("repeat ") {
            return self.parse_repeat(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("for each ") {
            return self.parse_for_each(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("give ") {
            return self.parse_function(indent, &line, rest);
        }

        if line.text == "try" {
            return self.parse_try(indent, &line);
        }

        if let Some(rest) = line.text.strip_prefix("throw ") {
            return Ok(Stmt::Throw(parse_expr(
                rest,
                line.line_number,
                line.indent + 7,
            )?));
        }

        if let Some(rest) = line.text.strip_prefix("use ") {
            return self.parse_use(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("export ") {
            return self.parse_export(indent, &line, rest);
        }

        if line.text.starts_with("pick ") || line.text == "pick" {
            return self.parse_pick(indent, &line);
        }

        if let Some(rest) = line.text.strip_prefix("let ") {
            return self.parse_let(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("const ") {
            return self.parse_const(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("struct ") {
            return self.parse_struct(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("enum ") {
            return self.parse_enum(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("impl ") {
            return self.parse_impl(indent, &line, rest);
        }

        if line.text == "loop" {
            return self.parse_loop(indent, &line);
        }

        if let Some(rest) = line.text.strip_prefix("while ") {
            return self.parse_while(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("until ") {
            return self.parse_until(indent, &line, rest);
        }

        if let Some(rest) = line.text.strip_prefix("assert ") {
            return self.parse_assert(indent, &line, rest);
        }

        if let Some((name, op, expr)) = split_compound_assignment(&line.text) {
            validate_identifier(name, line.line_number, line.indent + 1)?;
            return Ok(Stmt::CompoundAssign {
                name: name.to_string(),
                op,
                expr: parse_expr(expr, line.line_number, line.indent + name.len() + 4)?,
            });
        }

        if let Some((name, expr)) = split_assignment(&line.text) {
            validate_identifier(name, line.line_number, line.indent + 1)?;
            return Ok(Stmt::Assign {
                name: name.to_string(),
                expr: parse_expr(expr, line.line_number, line.indent + name.len() + 5)?,
            });
        }

        Ok(Stmt::Expr(parse_expr(
            &line.text,
            line.line_number,
            line.indent + 1,
        )?))
    }

    fn parse_check(
        &mut self,
        indent: usize,
        line: &SourceLine,
        condition_text: &str,
    ) -> Result<Stmt, FluxError> {
        let condition = parse_expr(condition_text, line.line_number, line.indent + 10)?;
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let then_branch = self.parse_block(child_indent)?;
        let mut else_branch = Vec::new();

        if let Some(next) = self.peek().cloned() {
            if next.indent == indent && next.text == "otherwise" {
                self.advance();
                let else_indent = self.required_child_indent(indent, next.line_number)?;
                else_branch = self.parse_block(else_indent)?;
            } else if next.indent == indent {
                if let Some(rest) = next.text.strip_prefix("otherwise if ") {
                    self.advance();
                    else_branch.push(self.parse_check(indent, &next, rest)?);
                }
            }
        }

        Ok(Stmt::Check {
            condition,
            then_branch,
            else_branch,
        })
    }

    fn parse_repeat(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let Some(count_text) = rest.strip_suffix(" times") else {
            return Err(FluxError::new(
                "only `repeat N times` is supported",
                line.line_number,
                line.indent + 1,
            ));
        };
        let count = parse_expr(count_text.trim(), line.line_number, line.indent + 8)?;
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        Ok(Stmt::RepeatTimes { count, body })
    }

    fn parse_for_each(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let Some((item, collection)) = rest.split_once(" in ") else {
            return Err(FluxError::new(
                "expected `for each item in collection`",
                line.line_number,
                line.indent + 1,
            ));
        };
        let item = item.trim();
        validate_identifier(item, line.line_number, line.indent + 10)?;
        let collection = parse_expr(
            collection.trim(),
            line.line_number,
            line.indent + 10 + item.len() + 4,
        )?;
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        Ok(Stmt::ForEach {
            item: item.to_string(),
            collection,
            body,
        })
    }

    fn parse_function(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let Some(open) = rest.find('(') else {
            return Err(FluxError::new(
                "expected function parameters, example: give add(a, b)",
                line.line_number,
                line.indent + 1,
            ));
        };
        let Some(close) = rest.rfind(')') else {
            return Err(FluxError::new(
                "expected `)`",
                line.line_number,
                line.indent + 1,
            ));
        };

        let name = rest[..open].trim();
        validate_identifier(name, line.line_number, line.indent + 6)?;

        let params_text = &rest[open + 1..close];
        let mut params = Vec::new();
        if !params_text.trim().is_empty() {
            for param in params_text.split(',') {
                let param = param.trim();
                validate_identifier(param, line.line_number, line.indent + 1)?;
                params.push(param.to_string());
            }
        }

        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        Ok(Stmt::Function {
            name: name.to_string(),
            params,
            body,
        })
    }

    fn parse_try(&mut self, indent: usize, line: &SourceLine) -> Result<Stmt, FluxError> {
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        let mut catches = Vec::new();
        let mut finally_body = None;

        while let Some(next) = self.peek().cloned() {
            if next.indent < indent {
                break;
            }
            if next.indent == indent && next.text.starts_with("catch") {
                self.advance();
                let error_name = if next.text == "catch" {
                    None
                } else {
                    next.text
                        .strip_prefix("catch ")
                        .map(|name| name.to_string())
                };
                let catch_indent = self.required_child_indent(indent, next.line_number)?;
                let catch_body = self.parse_block(catch_indent)?;
                catches.push(crate::ast::CatchClause {
                    error_name,
                    body: catch_body,
                });
            } else if next.indent == indent && next.text == "finally" {
                self.advance();
                let finally_indent = self.required_child_indent(indent, next.line_number)?;
                finally_body = Some(self.parse_block(finally_indent)?);
            } else {
                break;
            }
        }

        Ok(Stmt::Try {
            body,
            catches,
            finally_body,
            line: line.line_number,
        })
    }

    fn parse_use(
        &mut self,
        _indent: usize,
        _line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let clean = |s: &str| -> String { s.trim().trim_matches('"').to_string() };

        if let Some((path, names_str)) = rest.split_once(" use ") {
            let path = clean(path);
            let names: Vec<String> = names_str.split(',').map(&clean).collect();
            return Ok(Stmt::UseFrom { path, names });
        }

        let parts: Vec<&str> = rest.split(" as ").collect();
        let path = clean(parts[0]);
        let alias = if parts.len() > 1 {
            Some(clean(parts[1]))
        } else {
            None
        };

        Ok(Stmt::Use { path, alias })
    }

    fn parse_export(
        &mut self,
        _indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let name = rest.trim().to_string();
        validate_identifier(&name, line.line_number, line.indent + 8)?;
        Ok(Stmt::Export { name })
    }

    fn parse_pick(&mut self, indent: usize, line: &SourceLine) -> Result<Stmt, FluxError> {
        let expression = if line.text == "pick" {
            let expr_line = self.advance().clone();
            parse_expr(&expr_line.text, expr_line.line_number, expr_line.indent + 1)?
        } else {
            let rest = line.text.strip_prefix("pick ").unwrap_or("");
            parse_expr(rest, line.line_number, line.indent + 6)?
        };

        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let mut cases = Vec::new();
        let mut else_case = None;

        while let Some(next) = self.peek().cloned() {
            if next.indent < child_indent {
                break;
            }
            if next.indent == child_indent && next.text.starts_with("when ") {
                self.advance();
                let pattern_text = next.text.strip_prefix("when ").unwrap_or("");
                let pattern = parse_expr(pattern_text, next.line_number, next.indent + 6)?;
                let case_indent = self.required_child_indent(child_indent, next.line_number)?;
                let body = self.parse_block(case_indent)?;
                cases.push(crate::ast::PickCase { pattern, body });
            } else if next.indent == child_indent && next.text == "otherwise" {
                self.advance();
                let else_indent = self.required_child_indent(child_indent, next.line_number)?;
                else_case = Some(self.parse_block(else_indent)?);
            } else {
                break;
            }
        }

        Ok(Stmt::Pick {
            expression,
            cases,
            else_case,
        })
    }

    fn parse_let(
        &mut self,
        _indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let (name, type_hint, expr_text) =
            if let Some((name_part, expr_part)) = rest.split_once(" is ") {
                let name = name_part.trim();
                let (name, type_hint) = if let Some((n, t)) = name.split_once(": ") {
                    (n.trim(), Some(t.trim().to_string()))
                } else {
                    (name, None)
                };
                (name.to_string(), type_hint, expr_part.trim())
            } else {
                return Err(FluxError::new(
                    "expected `let name is value`",
                    line.line_number,
                    line.indent + 1,
                ));
            };

        validate_identifier(&name, line.line_number, line.indent + 5)?;
        let expr = parse_expr(expr_text, line.line_number, line.indent + name.len() + 6)?;
        Ok(Stmt::Let {
            name,
            type_hint,
            expr,
        })
    }

    fn parse_const(
        &mut self,
        _indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let (name, type_hint, expr_text) =
            if let Some((name_part, expr_part)) = rest.split_once(" is ") {
                let name = name_part.trim();
                let (name, type_hint) = if let Some((n, t)) = name.split_once(": ") {
                    (n.trim(), Some(t.trim().to_string()))
                } else {
                    (name, None)
                };
                (name.to_string(), type_hint, expr_part.trim())
            } else {
                return Err(FluxError::new(
                    "expected `const name is value`",
                    line.line_number,
                    line.indent + 1,
                ));
            };

        validate_identifier(&name, line.line_number, line.indent + 7)?;
        let expr = parse_expr(expr_text, line.line_number, line.indent + name.len() + 7)?;
        Ok(Stmt::Const {
            name,
            type_hint,
            expr,
        })
    }

    fn parse_struct(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let name = rest.trim().to_string();
        validate_identifier(&name, line.line_number, line.indent + 7)?;

        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let mut fields = Vec::new();

        while let Some(next) = self.peek().cloned() {
            if next.indent < child_indent {
                break;
            }
            if next.indent == child_indent {
                self.advance();
                let field = next.text.trim().to_string();
                if !field.is_empty() {
                    fields.push(field);
                }
            } else {
                break;
            }
        }

        Ok(Stmt::Struct { name, fields })
    }

    fn parse_enum(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let name = rest.trim().to_string();
        validate_identifier(&name, line.line_number, line.indent + 5)?;

        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let mut variants = Vec::new();

        while let Some(next) = self.peek().cloned() {
            if next.indent < child_indent {
                break;
            }
            if next.indent == child_indent {
                self.advance();
                let variant = next.text.trim().to_string();
                if !variant.is_empty() {
                    variants.push(variant);
                }
            } else {
                break;
            }
        }

        Ok(Stmt::Enum { name, variants })
    }

    fn parse_impl(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let struct_name = rest.trim().to_string();
        validate_identifier(&struct_name, line.line_number, line.indent + 5)?;

        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let mut methods = Vec::new();

        while let Some(next) = self.peek().cloned() {
            if next.indent < child_indent {
                break;
            }
            if next.indent == child_indent && next.text.starts_with("give ") {
                methods.push(self.parse_statement(child_indent)?);
            } else {
                break;
            }
        }

        Ok(Stmt::Impl {
            struct_name,
            methods,
        })
    }

    fn parse_loop(&mut self, indent: usize, line: &SourceLine) -> Result<Stmt, FluxError> {
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        Ok(Stmt::Loop { body })
    }

    fn parse_while(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let condition = parse_expr(rest, line.line_number, line.indent + 7)?;
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        Ok(Stmt::While { condition, body })
    }

    fn parse_until(
        &mut self,
        indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let condition = parse_expr(rest, line.line_number, line.indent + 7)?;
        let child_indent = self.required_child_indent(indent, line.line_number)?;
        let body = self.parse_block(child_indent)?;
        Ok(Stmt::Until { condition, body })
    }

    fn parse_assert(
        &mut self,
        _indent: usize,
        line: &SourceLine,
        rest: &str,
    ) -> Result<Stmt, FluxError> {
        let (condition_text, message_text) = if let Some((cond, msg)) = rest.split_once(", ") {
            (cond.trim(), Some(msg.trim()))
        } else {
            (rest.trim(), None)
        };

        let condition = parse_expr(condition_text, line.line_number, line.indent + 8)?;
        let message = if let Some(msg) = message_text {
            Some(parse_expr(
                msg,
                line.line_number,
                line.indent + 8 + condition_text.len() + 2,
            )?)
        } else {
            None
        };

        Ok(Stmt::Assert { condition, message })
    }

    fn required_child_indent(
        &self,
        parent_indent: usize,
        line_number: usize,
    ) -> Result<usize, FluxError> {
        let _ = line_number;
        let Some(next) = self.peek() else {
            return Err(FluxError::new(
                "expected indented block",
                line_number,
                parent_indent + 1,
            ));
        };

        if next.indent <= parent_indent {
            return Err(FluxError::new(
                "expected indented block",
                next.line_number,
                next.indent + 1,
            ));
        }

        Ok(next.indent)
    }

    fn peek(&self) -> Option<&SourceLine> {
        self.lines.get(self.current)
    }

    fn advance(&mut self) -> &SourceLine {
        let line = &self.lines[self.current];
        self.current += 1;
        line
    }
}

fn preprocess_lines(source: &str) -> Result<Vec<SourceLine>, FluxError> {
    let mut lines = Vec::new();
    let source = source.strip_prefix('\u{feff}').unwrap_or(source);

    for (index, raw_line) in source.lines().enumerate() {
        let line_number = index + 1;
        let without_comment = strip_comment(raw_line);
        if without_comment.trim().is_empty() {
            continue;
        }

        for (column, ch) in raw_line.chars().enumerate() {
            match ch {
                ' ' => {}
                '\t' => {
                    return Err(FluxError::new(
                        "tabs are not supported for indentation",
                        line_number,
                        column + 1,
                    ));
                }
                _ => break,
            }
        }

        let indent = without_comment.chars().take_while(|ch| *ch == ' ').count();

        lines.push(SourceLine {
            indent,
            text: without_comment.trim().to_string(),
            line_number,
        });
    }

    Ok(lines)
}

fn strip_comment(line: &str) -> String {
    let mut result = String::new();
    let mut chars = line.chars().peekable();
    let mut in_text = false;
    let mut escaped = false;

    while let Some(ch) = chars.next() {
        if in_text {
            result.push(ch);
            if escaped {
                escaped = false;
            } else if ch == '\\' {
                escaped = true;
            } else if ch == '"' {
                in_text = false;
            }
            continue;
        }

        if ch == '"' {
            in_text = true;
            result.push(ch);
            continue;
        }

        if !in_text && ch == '#' {
            break;
        }

        if !in_text && ch == '/' && chars.peek() == Some(&'/') {
            break;
        }

        result.push(ch);
    }

    result
}

fn split_assignment(text: &str) -> Option<(&str, &str)> {
    let (left, right) = text.split_once(" is ")?;
    if left.trim().contains(' ') {
        return None;
    }
    Some((left.trim(), right.trim()))
}

fn split_compound_assignment(text: &str) -> Option<(&str, CompoundOp, &str)> {
    for (symbol, op) in [
        ("+=", CompoundOp::Add),
        ("-=", CompoundOp::Subtract),
        ("*=", CompoundOp::Multiply),
        ("/=", CompoundOp::Divide),
    ] {
        if let Some((left, right)) = text.split_once(symbol) {
            let left = left.trim();
            if left.contains(' ') {
                return None;
            }
            return Some((left, op, right.trim()));
        }
    }
    None
}

fn validate_identifier(name: &str, line: usize, column: usize) -> Result<(), FluxError> {
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return Err(FluxError::new("expected variable name", line, column));
    };

    if !(first.is_ascii_alphabetic() || first == '_') {
        return Err(FluxError::new(
            format!("invalid variable name `{name}`"),
            line,
            column,
        ));
    }

    if chars.any(|ch| !(ch.is_ascii_alphanumeric() || ch == '_')) {
        return Err(FluxError::new(
            format!("invalid variable name `{name}`"),
            line,
            column,
        ));
    }

    Ok(())
}

fn parse_expr(source: &str, line: usize, column_offset: usize) -> Result<Expr, FluxError> {
    let tokens = lex_expression(source, line, column_offset.saturating_sub(1))?;
    let mut parser = ExprParser { tokens, current: 0 };
    let expr = parser.expression()?;

    if !matches!(parser.peek().kind, TokenKind::Eof) {
        let token = parser.peek();
        return Err(FluxError::new(
            "unexpected token after expression",
            token.line,
            token.column,
        ));
    }

    Ok(expr)
}

struct ExprParser {
    tokens: Vec<Token>,
    current: usize,
}

impl ExprParser {
    fn expression(&mut self) -> Result<Expr, FluxError> {
        // Check for arrow function: `param -> body` or `(p1, p2) -> body`
        // Lookahead: if we have Identifier Arrow, or LeftParen ... RightParen Arrow
        if self.is_arrow_function() {
            return self.parse_arrow_function();
        }
        self.or()
    }

    /// Returns true if the current token sequence looks like an arrow function.
    fn is_arrow_function(&self) -> bool {
        // Single-param: `ident ->`
        if let TokenKind::Identifier(_) = &self.tokens[self.current].kind {
            if let Some(next) = self.tokens.get(self.current + 1) {
                return matches!(next.kind, TokenKind::Arrow);
            }
        }
        // Multi-param: `( ident, ... ) ->`
        if matches!(self.tokens[self.current].kind, TokenKind::LeftParen) {
            // scan for matching ) then ->
            let mut depth = 0;
            let mut i = self.current;
            while i < self.tokens.len() {
                match &self.tokens[i].kind {
                    TokenKind::LeftParen => depth += 1,
                    TokenKind::RightParen => {
                        depth -= 1;
                        if depth == 0 {
                            if let Some(after) = self.tokens.get(i + 1) {
                                return matches!(after.kind, TokenKind::Arrow);
                            }
                            return false;
                        }
                    }
                    TokenKind::Eof | TokenKind::Newline => return false,
                    _ => {}
                }
                i += 1;
            }
        }
        false
    }

    /// Parse `param -> body` or `(p1, p2) -> body` as an ArrowFunction.
    fn parse_arrow_function(&mut self) -> Result<Expr, FluxError> {
        let params = if matches!(self.tokens[self.current].kind, TokenKind::LeftParen) {
            // consume `(`
            self.current += 1;
            let mut names = Vec::new();
            while !matches!(
                self.tokens[self.current].kind,
                TokenKind::RightParen | TokenKind::Eof
            ) {
                let t = self.advance().clone();
                if let TokenKind::Identifier(name) = t.kind {
                    names.push(name);
                }
                if matches!(self.tokens[self.current].kind, TokenKind::Comma) {
                    self.current += 1;
                }
            }
            // consume `)`
            self.consume(
                |k| matches!(k, TokenKind::RightParen),
                "expected `)` in arrow function params",
            )?;
            names
        } else {
            // single identifier
            let t = self.advance().clone();
            match t.kind {
                TokenKind::Identifier(name) => vec![name],
                _ => return Err(FluxError::new("expected parameter name", t.line, t.column)),
            }
        };
        // consume `->`
        self.consume(
            |k| matches!(k, TokenKind::Arrow),
            "expected `->` in arrow function",
        )?;
        let body = self.expression()?;
        Ok(Expr::ArrowFunction {
            params,
            body: Box::new(body),
        })
    }

    fn or(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.bitwise_or()?;

        while self.matches(|kind| matches!(kind, TokenKind::Or)) {
            let right = self.bitwise_or()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op: BinaryOp::Or,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn bitwise_or(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.bitwise_xor()?;

        while self.matches(|kind| matches!(kind, TokenKind::BitwiseOr)) {
            let right = self.bitwise_xor()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op: BinaryOp::BitwiseOr,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn bitwise_xor(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.bitwise_and()?;

        while self.matches(|kind| matches!(kind, TokenKind::BitwiseXor)) {
            let right = self.bitwise_and()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op: BinaryOp::BitwiseXor,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn bitwise_and(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.and()?;

        while self.matches(|kind| matches!(kind, TokenKind::BitwiseAnd)) {
            let right = self.and()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op: BinaryOp::BitwiseAnd,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn and(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.equality()?;

        while self.matches(|kind| matches!(kind, TokenKind::And)) {
            let right = self.equality()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op: BinaryOp::And,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn equality(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.comparison()?;

        loop {
            let op = if self.matches(|kind| matches!(kind, TokenKind::EqualEqual)) {
                Some(BinaryOp::Equal)
            } else if self.matches(|kind| matches!(kind, TokenKind::BangEqual)) {
                Some(BinaryOp::NotEqual)
            } else if self.matches(|kind| matches!(kind, TokenKind::Is)) {
                if self.matches(|kind| matches!(kind, TokenKind::Not)) {
                    Some(BinaryOp::NotEqual)
                } else {
                    Some(BinaryOp::Equal)
                }
            } else {
                None
            };

            let Some(op) = op else {
                break;
            };

            let right = self.comparison()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn comparison(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.shift()?;

        loop {
            let op = if self.matches(|kind| matches!(kind, TokenKind::Greater)) {
                Some(BinaryOp::Greater)
            } else if self.matches(|kind| matches!(kind, TokenKind::GreaterEqual)) {
                Some(BinaryOp::GreaterEqual)
            } else if self.matches(|kind| matches!(kind, TokenKind::Less)) {
                Some(BinaryOp::Less)
            } else if self.matches(|kind| matches!(kind, TokenKind::LessEqual)) {
                Some(BinaryOp::LessEqual)
            } else {
                None
            };

            let Some(op) = op else {
                break;
            };

            let right = self.shift()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn shift(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.term()?;

        loop {
            let op = if self.matches(|kind| matches!(kind, TokenKind::ShiftLeft)) {
                Some(BinaryOp::ShiftLeft)
            } else if self.matches(|kind| matches!(kind, TokenKind::ShiftRight)) {
                Some(BinaryOp::ShiftRight)
            } else {
                None
            };

            let Some(op) = op else {
                break;
            };

            let right = self.term()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn term(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.factor()?;

        loop {
            let op = if self.matches(|kind| matches!(kind, TokenKind::Plus)) {
                Some(BinaryOp::Add)
            } else if self.matches(|kind| matches!(kind, TokenKind::Minus)) {
                Some(BinaryOp::Subtract)
            } else {
                None
            };

            let Some(op) = op else {
                break;
            };

            let right = self.factor()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn factor(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.power()?;

        loop {
            let op = if self.matches(|kind| matches!(kind, TokenKind::Star)) {
                Some(BinaryOp::Multiply)
            } else if self.matches(|kind| matches!(kind, TokenKind::Slash)) {
                Some(BinaryOp::Divide)
            } else if self.matches(|kind| matches!(kind, TokenKind::Percent)) {
                Some(BinaryOp::Remainder)
            } else {
                None
            };

            let Some(op) = op else {
                break;
            };

            let right = self.power()?;
            expr = Expr::Binary {
                left: Box::new(expr),
                op,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn power(&mut self) -> Result<Expr, FluxError> {
        let expr = self.unary()?;

        if self.matches(|kind| matches!(kind, TokenKind::Power)) {
            let right = self.power()?;
            return Ok(Expr::Binary {
                left: Box::new(expr),
                op: BinaryOp::Power,
                right: Box::new(right),
            });
        }

        Ok(expr)
    }

    fn unary(&mut self) -> Result<Expr, FluxError> {
        if self.matches(|kind| matches!(kind, TokenKind::Not)) {
            let right = self.unary()?;
            return Ok(Expr::Unary {
                op: UnaryOp::Not,
                right: Box::new(right),
            });
        }

        if self.matches(|kind| matches!(kind, TokenKind::Minus)) {
            let right = self.unary()?;
            return Ok(Expr::Unary {
                op: UnaryOp::Negate,
                right: Box::new(right),
            });
        }

        if self.matches(|kind| matches!(kind, TokenKind::Plus)) {
            let right = self.unary()?;
            return Ok(right);
        }

        if self.matches(|kind| matches!(kind, TokenKind::BitwiseNot)) {
            let right = self.unary()?;
            return Ok(Expr::Unary {
                op: UnaryOp::Not,
                right: Box::new(right),
            });
        }

        self.postfix()
    }

    fn postfix(&mut self) -> Result<Expr, FluxError> {
        let mut expr = self.primary()?;

        loop {
            if self.matches(|kind| matches!(kind, TokenKind::LeftParen)) {
                let args = self.argument_list(TokenKind::RightParen)?;
                expr = Expr::Call {
                    callee: Box::new(expr),
                    args,
                };
            } else if self.matches(|kind| matches!(kind, TokenKind::LeftBracket)) {
                let index = self.expression()?;
                self.consume(
                    |kind| matches!(kind, TokenKind::RightBracket),
                    "expected `]`",
                )?;
                expr = Expr::Index {
                    target: Box::new(expr),
                    index: Box::new(index),
                };
            } else if self.matches(|kind| matches!(kind, TokenKind::Dot)) {
                let token = self.advance().clone();
                let name = match token.kind {
                    TokenKind::Identifier(name) => name,
                    TokenKind::Error => "error".to_string(),
                    _ => {
                        return Err(FluxError::new(
                            "expected property name after `.`",
                            token.line,
                            token.column,
                        ));
                    }
                };
                expr = Expr::Property {
                    target: Box::new(expr),
                    name,
                };
            } else {
                break;
            }
        }

        Ok(expr)
    }

    fn primary(&mut self) -> Result<Expr, FluxError> {
        let token = self.advance().clone();
        match token.kind {
            TokenKind::Number(value) => Ok(Expr::Number(value)),
            TokenKind::Text(value) => {
                // Parse string interpolation: "Hello {name}!" → InterpolatedText
                if value.contains('{') {
                    parse_interpolated_text(&value, token.line, token.column)
                } else {
                    Ok(Expr::Text(value))
                }
            }
            TokenKind::Yes => Ok(Expr::Bool(true)),
            TokenKind::No => Ok(Expr::Bool(false)),
            TokenKind::Nothing => Ok(Expr::Nothing),
            TokenKind::Identifier(name) if name == "input" => {
                let prompt = self.unary()?;
                Ok(Expr::Input(Box::new(prompt)))
            }
            TokenKind::Identifier(name) if name == "input_number" => {
                let prompt = self.unary()?;
                Ok(Expr::InputNumber(Box::new(prompt)))
            }
            TokenKind::Identifier(name) if name == "size_of" => {
                self.consume(|kind| matches!(kind, TokenKind::LeftParen), "expected `(`")?;
                let expr = self.expression()?;
                self.consume(|kind| matches!(kind, TokenKind::RightParen), "expected `)`")?;
                Ok(Expr::SizeOf(Box::new(expr)))
            }
            TokenKind::Identifier(name) if name == "type_of" => {
                self.consume(|kind| matches!(kind, TokenKind::LeftParen), "expected `(`")?;
                let expr = self.expression()?;
                self.consume(|kind| matches!(kind, TokenKind::RightParen), "expected `)`")?;
                Ok(Expr::TypeOf(Box::new(expr)))
            }
            TokenKind::Identifier(name) => Ok(Expr::Variable {
                name,
                line: token.line,
            }),
            TokenKind::Error => Ok(Expr::Variable {
                name: "error".to_string(),
                line: token.line,
            }),
            TokenKind::LeftParen => {
                let expr = self.expression()?;
                self.consume(|kind| matches!(kind, TokenKind::RightParen), "expected `)`")?;
                Ok(Expr::Grouping(Box::new(expr)))
            }
            TokenKind::LeftBracket => self.list_literal(),
            TokenKind::LeftBrace => self.object_literal(),
            TokenKind::Eof => Err(FluxError::new(
                "expected expression",
                token.line,
                token.column,
            )),
            _ => Err(FluxError::new(
                "expected expression",
                token.line,
                token.column,
            )),
        }
    }

    fn list_literal(&mut self) -> Result<Expr, FluxError> {
        let mut values = Vec::new();
        if self.matches(|kind| matches!(kind, TokenKind::RightBracket)) {
            return Ok(Expr::List(values));
        }

        loop {
            values.push(self.expression()?);
            if self.matches(|kind| matches!(kind, TokenKind::Comma)) {
                if self.matches(|kind| matches!(kind, TokenKind::RightBracket)) {
                    break;
                }
                continue;
            }
            self.consume(
                |kind| matches!(kind, TokenKind::RightBracket),
                "expected `]`",
            )?;
            break;
        }

        Ok(Expr::List(values))
    }

    fn object_literal(&mut self) -> Result<Expr, FluxError> {
        let mut fields = Vec::new();
        if self.matches(|kind| matches!(kind, TokenKind::RightBrace)) {
            return Ok(Expr::Object(fields));
        }

        loop {
            let token = self.advance().clone();
            let key = match token.kind {
                TokenKind::Identifier(name) | TokenKind::Text(name) => name,
                _ => {
                    return Err(FluxError::new(
                        "expected object key",
                        token.line,
                        token.column,
                    ));
                }
            };

            self.consume(|kind| matches!(kind, TokenKind::Colon), "expected `:`")?;
            let value = self.expression()?;
            fields.push((key, value));

            if self.matches(|kind| matches!(kind, TokenKind::Comma)) {
                if self.matches(|kind| matches!(kind, TokenKind::RightBrace)) {
                    break;
                }
                continue;
            }
            self.consume(|kind| matches!(kind, TokenKind::RightBrace), "expected `}`")?;
            break;
        }

        Ok(Expr::Object(fields))
    }

    fn argument_list(&mut self, closing: TokenKind) -> Result<Vec<Expr>, FluxError> {
        let mut args = Vec::new();

        if self.matches(|kind| same_variant(kind, &closing)) {
            return Ok(args);
        }

        loop {
            args.push(self.expression()?);
            if self.matches(|kind| matches!(kind, TokenKind::Comma)) {
                if self.matches(|kind| same_variant(kind, &closing)) {
                    break;
                }
                continue;
            }
            self.consume(
                |kind| same_variant(kind, &closing),
                "expected closing delimiter",
            )?;
            break;
        }

        Ok(args)
    }

    fn consume(
        &mut self,
        predicate: impl FnOnce(&TokenKind) -> bool,
        message: &str,
    ) -> Result<(), FluxError> {
        if self.matches(predicate) {
            Ok(())
        } else {
            let token = self.peek();
            Err(FluxError::new(message, token.line, token.column))
        }
    }

    fn matches(&mut self, predicate: impl FnOnce(&TokenKind) -> bool) -> bool {
        if predicate(&self.peek().kind) {
            self.current += 1;
            true
        } else {
            false
        }
    }

    fn advance(&mut self) -> &Token {
        if !matches!(self.peek().kind, TokenKind::Eof) {
            self.current += 1;
        }
        &self.tokens[self.current - 1]
    }

    fn peek(&self) -> &Token {
        &self.tokens[self.current]
    }
}

fn same_variant(a: &TokenKind, b: &TokenKind) -> bool {
    std::mem::discriminant(a) == std::mem::discriminant(b)
}

/// Parse a string literal that may contain `{expr}` interpolations.
/// Returns `Expr::Text` if there are no valid interpolations, or
/// `Expr::InterpolatedText` if there are one or more.
fn parse_interpolated_text(
    value: &str,
    line: usize,
    _column: usize,
) -> Result<crate::ast::Expr, FluxError> {
    use crate::ast::TextPart;

    let chars: Vec<char> = value.chars().collect();
    let mut parts: Vec<TextPart> = Vec::new();
    let mut i = 0;
    let mut current_lit = String::new();

    while i < chars.len() {
        if chars[i] == '{' {
            // Check for escaped `{{`
            if i + 1 < chars.len() && chars[i + 1] == '{' {
                current_lit.push('{');
                i += 2;
                continue;
            }
            // Find matching `}`
            let start = i + 1;
            let mut end = start;
            let mut depth = 1usize;
            while end < chars.len() && depth > 0 {
                if chars[end] == '{' {
                    depth += 1;
                }
                if chars[end] == '}' {
                    depth -= 1;
                }
                if depth > 0 {
                    end += 1;
                }
            }
            if depth != 0 {
                // Unmatched brace — treat as literal.
                current_lit.push(chars[i]);
                i += 1;
                continue;
            }
            // Push accumulated literal (may be empty).
            if !current_lit.is_empty() {
                parts.push(TextPart::Literal(current_lit.clone()));
                current_lit.clear();
            }
            // Parse the inner expression.
            let inner: String = chars[start..end].iter().collect();
            let inner = inner.trim();
            // Wrap as assignment so parse() can handle it.
            let wrapped = format!("__ipl is {inner}");
            match crate::parser::parse(&wrapped) {
                Ok(prog) => {
                    if let crate::ast::Stmt::Assign { expr, .. } = prog
                        .statements
                        .into_iter()
                        .next()
                        .unwrap_or(crate::ast::Stmt::Expr(crate::ast::Expr::Nothing))
                    {
                        parts.push(TextPart::Interpolation(expr));
                    } else {
                        // Fallback: try as bare expr
                        match parse_expr(inner, line, 0) {
                            Ok(e) => parts.push(TextPart::Interpolation(e)),
                            Err(_) => {
                                current_lit.push('{');
                                current_lit.push_str(inner);
                                current_lit.push('}');
                            }
                        }
                    }
                }
                Err(_) => {
                    // Not a valid expression — keep as literal.
                    current_lit.push('{');
                    current_lit.push_str(inner);
                    current_lit.push('}');
                }
            }
            i = end + 1;
        } else if chars[i] == '}' && i + 1 < chars.len() && chars[i + 1] == '}' {
            // Escaped `}}`
            current_lit.push('}');
            i += 2;
        } else {
            current_lit.push(chars[i]);
            i += 1;
        }
    }

    if !current_lit.is_empty() {
        parts.push(TextPart::Literal(current_lit));
    }

    // If no interpolations found, return plain text.
    let has_interp = parts
        .iter()
        .any(|p| matches!(p, TextPart::Interpolation(_)));
    if !has_interp {
        let text = parts
            .into_iter()
            .map(|p| match p {
                TextPart::Literal(s) => s,
                TextPart::Interpolation(_) => String::new(),
            })
            .collect();
        return Ok(crate::ast::Expr::Text(text));
    }

    Ok(crate::ast::Expr::InterpolatedText(parts))
}

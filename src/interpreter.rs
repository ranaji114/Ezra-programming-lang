use std::collections::BTreeMap;
use std::io::{self, Write};
use std::process;
use std::rc::Rc;

use crate::ast::{BinaryOp, CompoundOp, Expr, Program, Stmt, UnaryOp};
use crate::environment::Environment;
use crate::error::FluxError;
use crate::parser;
use crate::value::{FunctionValue, Value};

pub struct Interpreter {
    env: Environment,
}

#[derive(Debug)]
enum Flow {
    Normal,
    Return(Value),
    Break,
    Continue,
}

impl Interpreter {
    pub fn new() -> Self {
        Self {
            env: Environment::new(),
        }
    }

    pub fn run(&mut self, program: &Program) -> Result<(), FluxError> {
        for statement in &program.statements {
            match self.execute(statement)? {
                Flow::Normal => {}
                Flow::Return(_) => return Err(FluxError::runtime("return used outside function")),
                Flow::Break => return Err(FluxError::runtime("break used outside loop")),
                Flow::Continue => return Err(FluxError::runtime("next used outside loop")),
            }
        }
        Ok(())
    }

    fn execute_block(&mut self, statements: &[Stmt]) -> Result<Flow, FluxError> {
        self.env.push_scope();
        let result = (|| {
            for statement in statements {
                match self.execute(statement)? {
                    Flow::Normal => {}
                    flow => return Ok(flow),
                }
            }
            Ok(Flow::Normal)
        })();
        self.env.pop_scope();
        result
    }

    fn execute(&mut self, statement: &Stmt) -> Result<Flow, FluxError> {
        match statement {
            Stmt::Say(expr) => {
                let value = self.evaluate(expr)?;
                println!("{value}");
            }
            Stmt::Write(expr) => {
                let value = self.evaluate(expr)?;
                print!("{value}");
                io::stdout()
                    .flush()
                    .map_err(|err| FluxError::runtime(err.to_string()))?;
            }
            Stmt::Warn(expr) => {
                let value = self.evaluate(expr)?;
                eprintln!("warning: {value}");
            }
            Stmt::Fail(expr) => {
                let value = self.evaluate(expr)?;
                eprintln!("error: {value}");
            }
            Stmt::Debug(expr) => {
                let value = self.evaluate(expr)?;
                eprintln!("debug: {value}");
            }
            Stmt::Clear => {
                print!("\x1B[2J\x1B[1;1H");
                io::stdout()
                    .flush()
                    .map_err(|err| FluxError::runtime(err.to_string()))?;
            }
            Stmt::Exit(expr) => {
                let code = self.evaluate(expr)?;
                let Value::Number(code) = code else {
                    return Err(FluxError::runtime("exit code must be a number"));
                };
                process::exit(code as i32);
            }
            Stmt::Assign { name, expr } => {
                let value = self.evaluate(expr)?;
                self.env.assign(name, value)?;
            }
            Stmt::CompoundAssign { name, op, expr } => {
                let current = self
                    .env
                    .get(name)
                    .ok_or_else(|| FluxError::runtime(format!("undefined variable `{name}`")))?;
                let right = self.evaluate(expr)?;
                let binary_op = match op {
                    CompoundOp::Add => BinaryOp::Add,
                    CompoundOp::Subtract => BinaryOp::Subtract,
                    CompoundOp::Multiply => BinaryOp::Multiply,
                    CompoundOp::Divide => BinaryOp::Divide,
                };
                let value = self.evaluate_binary(current, binary_op, right)?;
                self.env.assign(name, value)?;
            }
            Stmt::Check {
                condition,
                then_branch,
                else_branch,
            } => {
                let condition = self.evaluate(condition)?;
                let branch = if condition.is_truthy() {
                    then_branch
                } else {
                    else_branch
                };
                match self.execute_block(branch)? {
                    Flow::Normal => {}
                    flow => return Ok(flow),
                }
            }
            Stmt::RepeatTimes { count, body } => {
                let count = self.evaluate(count)?;
                let Value::Number(count) = count else {
                    return Err(FluxError::runtime("repeat count must be a number"));
                };
                let count = expect_non_negative_integer(count, "repeat count")?;
                for _ in 0..count {
                    match self.execute_block(body)? {
                        Flow::Normal => {}
                        Flow::Continue => continue,
                        Flow::Break => break,
                        flow @ Flow::Return(_) => return Ok(flow),
                    }
                }
            }
            Stmt::ForEach {
                item,
                collection,
                body,
            } => {
                let collection = self.evaluate(collection)?;
                let Value::List(values) = collection else {
                    return Err(FluxError::runtime("for each requires a list"));
                };
                for value in values {
                    self.env.push_scope();
                    self.env.define(item, value);
                    let result = (|| {
                        for statement in body {
                            match self.execute(statement)? {
                                Flow::Normal => {}
                                flow => return Ok(flow),
                            }
                        }
                        Ok(Flow::Normal)
                    })();
                    self.env.pop_scope();

                    match result? {
                        Flow::Normal => {}
                        Flow::Continue => continue,
                        Flow::Break => break,
                        flow @ Flow::Return(_) => return Ok(flow),
                    }
                }
            }
            Stmt::Function { name, params, body } => {
                let function = FunctionValue {
                    name: name.clone(),
                    params: params.clone(),
                    body: body.clone(),
                };
                self.env.define(name, Value::Function(Rc::new(function)));
            }
            Stmt::Return(expr) => {
                let value = self.evaluate(expr)?;
                return Ok(Flow::Return(value));
            }
            Stmt::Break => return Ok(Flow::Break),
            Stmt::Next => return Ok(Flow::Continue),
            Stmt::Expr(expr) => {
                self.evaluate(expr)?;
            }
        }

        Ok(Flow::Normal)
    }

    fn evaluate(&mut self, expr: &Expr) -> Result<Value, FluxError> {
        match expr {
            Expr::Number(value) => Ok(Value::Number(*value)),
            Expr::Text(value) => self.interpolate_text(value),
            Expr::Bool(value) => Ok(Value::Bool(*value)),
            Expr::Nothing => Ok(Value::Nothing),
            Expr::Variable(name) => self
                .env
                .get(name)
                .ok_or_else(|| FluxError::runtime(format!("undefined variable `{name}`"))),
            Expr::List(values) => values
                .iter()
                .map(|expr| self.evaluate(expr))
                .collect::<Result<Vec<_>, _>>()
                .map(Value::List),
            Expr::Object(fields) => {
                let mut object = BTreeMap::new();
                for (key, expr) in fields {
                    object.insert(key.clone(), self.evaluate(expr)?);
                }
                Ok(Value::Object(object))
            }
            Expr::Input(prompt) => {
                let prompt = self.evaluate(prompt)?;
                print!("{prompt}");
                io::stdout()
                    .flush()
                    .map_err(|err| FluxError::runtime(err.to_string()))?;

                let mut input = String::new();
                io::stdin()
                    .read_line(&mut input)
                    .map_err(|err| FluxError::runtime(err.to_string()))?;
                Ok(Value::Text(
                    input.trim_end_matches(['\r', '\n']).to_string(),
                ))
            }
            Expr::InputNumber(prompt) => {
                let value = self.evaluate(&Expr::Input(prompt.clone()))?;
                let Value::Text(text) = value else {
                    unreachable!();
                };
                let number = text.trim().parse::<f64>().map_err(|_| {
                    FluxError::runtime(format!("expected number input, got `{}`", text.trim()))
                })?;
                Ok(Value::Number(number))
            }
            Expr::Unary { op, right } => {
                let right = self.evaluate(right)?;
                match op {
                    UnaryOp::Negate => match right {
                        Value::Number(value) => Ok(Value::Number(-value)),
                        other => Err(FluxError::runtime(format!(
                            "cannot negate {}",
                            other.type_name()
                        ))),
                    },
                    UnaryOp::Not => Ok(Value::Bool(!right.is_truthy())),
                }
            }
            Expr::Binary { left, op, right } => {
                if *op == BinaryOp::And {
                    let left = self.evaluate(left)?;
                    if !left.is_truthy() {
                        return Ok(Value::Bool(false));
                    }
                    return Ok(Value::Bool(self.evaluate(right)?.is_truthy()));
                }

                if *op == BinaryOp::Or {
                    let left = self.evaluate(left)?;
                    if left.is_truthy() {
                        return Ok(Value::Bool(true));
                    }
                    return Ok(Value::Bool(self.evaluate(right)?.is_truthy()));
                }

                let left = self.evaluate(left)?;
                let right = self.evaluate(right)?;
                self.evaluate_binary(left, *op, right)
            }
            Expr::Call { callee, args } => self.call(callee, args),
            Expr::Index { target, index } => {
                let target = self.evaluate(target)?;
                let index = self.evaluate(index)?;
                self.index_value(target, index)
            }
            Expr::Property { target, name } => {
                let target = self.evaluate(target)?;
                self.property_value(target, name)
            }
            Expr::Grouping(expr) => self.evaluate(expr),
        }
    }

    fn call(&mut self, callee: &Expr, args: &[Expr]) -> Result<Value, FluxError> {
        if let Expr::Variable(name) = callee {
            let values = self.evaluate_args(args)?;
            if let Some(value) = self.call_builtin(name, values)? {
                return Ok(value);
            }
        }

        if let Expr::Property { target, name } = callee {
            let target = self.evaluate(target)?;
            let values = self.evaluate_args(args)?;
            return self.call_method(target, name, values);
        }

        let callee = self.evaluate(callee)?;
        let Value::Function(function) = callee else {
            return Err(FluxError::runtime(format!(
                "cannot call {}",
                callee.type_name()
            )));
        };

        if function.params.len() != args.len() {
            return Err(FluxError::runtime(format!(
                "function `{}` expected {} arguments, got {}",
                function.name,
                function.params.len(),
                args.len()
            )));
        }

        let values = self.evaluate_args(args)?;
        self.env.push_scope();
        for (param, value) in function.params.iter().zip(values) {
            self.env.define(param, value);
        }
        let result = self.execute_block(&function.body);
        self.env.pop_scope();

        match result? {
            Flow::Return(value) => Ok(value),
            Flow::Normal => Ok(Value::Nothing),
            Flow::Break => Err(FluxError::runtime("break used outside loop")),
            Flow::Continue => Err(FluxError::runtime("next used outside loop")),
        }
    }

    fn evaluate_args(&mut self, args: &[Expr]) -> Result<Vec<Value>, FluxError> {
        args.iter().map(|arg| self.evaluate(arg)).collect()
    }

    fn call_builtin(&mut self, name: &str, args: Vec<Value>) -> Result<Option<Value>, FluxError> {
        let value = match name {
            "len" => {
                expect_arg_count(name, &args, 1)?;
                Value::Number(length_of(&args[0])? as f64)
            }
            "type_of" => {
                expect_arg_count(name, &args, 1)?;
                Value::Text(args[0].type_name().to_string())
            }
            "text" => {
                expect_arg_count(name, &args, 1)?;
                Value::Text(args[0].to_string())
            }
            "number" => {
                expect_arg_count(name, &args, 1)?;
                let text = args[0].to_string();
                Value::Number(text.trim().parse().map_err(|_| {
                    FluxError::runtime(format!("cannot convert `{text}` to number"))
                })?)
            }
            _ => return Ok(None),
        };
        Ok(Some(value))
    }

    fn call_method(
        &mut self,
        target: Value,
        name: &str,
        args: Vec<Value>,
    ) -> Result<Value, FluxError> {
        match (target, name) {
            (Value::Text(text), "upper") => {
                expect_arg_count(name, &args, 0)?;
                Ok(Value::Text(text.to_uppercase()))
            }
            (Value::Text(text), "lower") => {
                expect_arg_count(name, &args, 0)?;
                Ok(Value::Text(text.to_lowercase()))
            }
            (Value::Text(text), "trim") => {
                expect_arg_count(name, &args, 0)?;
                Ok(Value::Text(text.trim().to_string()))
            }
            (Value::Text(text), "contains") => {
                expect_arg_count(name, &args, 1)?;
                Ok(Value::Bool(text.contains(&args[0].to_string())))
            }
            (Value::List(values), "push") => {
                expect_arg_count(name, &args, 1)?;
                let mut values = values;
                values.push(args[0].clone());
                Ok(Value::List(values))
            }
            (Value::List(values), "take") => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(count) = args[0] else {
                    return Err(FluxError::runtime("take count must be a number"));
                };
                let count = expect_non_negative_integer(count, "take count")?;
                Ok(Value::List(values.into_iter().take(count).collect()))
            }
            (Value::List(values), "drop") => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(count) = args[0] else {
                    return Err(FluxError::runtime("drop count must be a number"));
                };
                let count = expect_non_negative_integer(count, "drop count")?;
                Ok(Value::List(values.into_iter().skip(count).collect()))
            }
            (other, method) => Err(FluxError::runtime(format!(
                "{} has no method `{method}`",
                other.type_name()
            ))),
        }
    }

    fn evaluate_binary(&self, left: Value, op: BinaryOp, right: Value) -> Result<Value, FluxError> {
        match op {
            BinaryOp::Add => match (left, right) {
                (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a + b)),
                (Value::List(mut a), Value::List(b)) => {
                    a.extend(b);
                    Ok(Value::List(a))
                }
                (a, b) => Ok(Value::Text(format!("{a}{b}"))),
            },
            BinaryOp::Subtract => number_binary(left, right, |a, b| a - b),
            BinaryOp::Multiply => number_binary(left, right, |a, b| a * b),
            BinaryOp::Divide => {
                let (a, b) = expect_numbers(left, right)?;
                if b == 0.0 {
                    Err(FluxError::runtime("divide by zero"))
                } else {
                    Ok(Value::Number(a / b))
                }
            }
            BinaryOp::Remainder => {
                let (a, b) = expect_numbers(left, right)?;
                if b == 0.0 {
                    Err(FluxError::runtime("remainder by zero"))
                } else {
                    Ok(Value::Number(a % b))
                }
            }
            BinaryOp::Greater => compare_numbers(left, right, |a, b| a > b),
            BinaryOp::GreaterEqual => compare_numbers(left, right, |a, b| a >= b),
            BinaryOp::Less => compare_numbers(left, right, |a, b| a < b),
            BinaryOp::LessEqual => compare_numbers(left, right, |a, b| a <= b),
            BinaryOp::Equal => Ok(Value::Bool(left == right)),
            BinaryOp::NotEqual => Ok(Value::Bool(left != right)),
            BinaryOp::And | BinaryOp::Or => {
                unreachable!("logical ops are handled before binary evaluation")
            }
        }
    }

    fn index_value(&self, target: Value, index: Value) -> Result<Value, FluxError> {
        match (target, index) {
            (Value::List(values), Value::Number(index)) => {
                let index = expect_non_negative_integer(index, "list index")?;
                Ok(values.get(index).cloned().unwrap_or(Value::Nothing))
            }
            (Value::Text(text), Value::Number(index)) => {
                let index = expect_non_negative_integer(index, "text index")?;
                Ok(text
                    .chars()
                    .nth(index)
                    .map(|ch| Value::Text(ch.to_string()))
                    .unwrap_or(Value::Nothing))
            }
            (Value::Object(object), Value::Text(key)) => {
                Ok(object.get(&key).cloned().unwrap_or(Value::Nothing))
            }
            (target, index) => Err(FluxError::runtime(format!(
                "cannot index {} with {}",
                target.type_name(),
                index.type_name()
            ))),
        }
    }

    fn property_value(&self, target: Value, name: &str) -> Result<Value, FluxError> {
        match target {
            Value::Object(object) => Ok(object.get(name).cloned().unwrap_or(Value::Nothing)),
            Value::List(values) if name == "length" => Ok(Value::Number(values.len() as f64)),
            Value::Text(text) if name == "length" => Ok(Value::Number(text.chars().count() as f64)),
            other => Err(FluxError::runtime(format!(
                "{} has no property `{name}`",
                other.type_name()
            ))),
        }
    }

    fn interpolate_text(&mut self, text: &str) -> Result<Value, FluxError> {
        let mut output = String::new();
        let chars: Vec<char> = text.chars().collect();
        let mut index = 0;

        while index < chars.len() {
            if chars[index] == '{' {
                let start = index + 1;
                let mut end = start;

                while end < chars.len() && chars[end] != '}' {
                    end += 1;
                }

                if end >= chars.len() {
                    return Err(FluxError::runtime("unterminated interpolation"));
                }

                let expression: String = chars[start..end].iter().collect();
                let program = parser::parse(&format!("__value is {}", expression.trim()))?;
                let Stmt::Assign { expr, .. } = &program.statements[0] else {
                    unreachable!();
                };
                let value = self.evaluate(expr)?;
                output.push_str(&value.to_string());
                index = end + 1;
            } else {
                output.push(chars[index]);
                index += 1;
            }
        }

        Ok(Value::Text(output))
    }
}

impl Default for Interpreter {
    fn default() -> Self {
        Self::new()
    }
}

fn number_binary(
    left: Value,
    right: Value,
    op: impl FnOnce(f64, f64) -> f64,
) -> Result<Value, FluxError> {
    let (left, right) = expect_numbers(left, right)?;
    Ok(Value::Number(op(left, right)))
}

fn compare_numbers(
    left: Value,
    right: Value,
    op: impl FnOnce(f64, f64) -> bool,
) -> Result<Value, FluxError> {
    let (left, right) = expect_numbers(left, right)?;
    Ok(Value::Bool(op(left, right)))
}

fn expect_numbers(left: Value, right: Value) -> Result<(f64, f64), FluxError> {
    match (left, right) {
        (Value::Number(left), Value::Number(right)) => Ok((left, right)),
        (left, right) => Err(FluxError::runtime(format!(
            "expected numbers, got {} and {}",
            left.type_name(),
            right.type_name()
        ))),
    }
}

fn expect_arg_count(name: &str, args: &[Value], expected: usize) -> Result<(), FluxError> {
    if args.len() == expected {
        Ok(())
    } else {
        Err(FluxError::runtime(format!(
            "`{name}` expected {expected} arguments, got {}",
            args.len()
        )))
    }
}

fn expect_non_negative_integer(value: f64, name: &str) -> Result<usize, FluxError> {
    if !value.is_finite() || value < 0.0 || value.fract() != 0.0 {
        return Err(FluxError::runtime(format!(
            "{name} must be a non-negative integer"
        )));
    }

    if value > usize::MAX as f64 {
        return Err(FluxError::runtime(format!("{name} is too large")));
    }

    Ok(value as usize)
}

fn length_of(value: &Value) -> Result<usize, FluxError> {
    match value {
        Value::Text(text) => Ok(text.chars().count()),
        Value::List(values) => Ok(values.len()),
        Value::Object(values) => Ok(values.len()),
        other => Err(FluxError::runtime(format!(
            "cannot get length of {}",
            other.type_name()
        ))),
    }
}

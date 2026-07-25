use std::collections::BTreeMap;
use std::io::{self, Write};
use std::process;
use std::rc::Rc;

use crate::ast::{BinaryOp, CompoundOp, Expr, Program, Stmt, UnaryOp};
use crate::bytecode::{ExprChunk, Instr};
use crate::environment::Environment;
use crate::error::EzraError as FluxError;
use crate::parser;
use crate::value::{FunctionValue, Value};
use crate::vm::ExprVM;

pub struct Interpreter {
    env: Environment,
    modules: std::collections::HashMap<String, std::collections::HashMap<String, Value>>,
}

#[derive(Debug)]
enum Flow {
    Normal,
    Return(Value),
    Break,
    Continue,
    Throw(Value),
}

impl Interpreter {
    pub fn new() -> Self {
        Self {
            env: Environment::new(),
            modules: std::collections::HashMap::new(),
        }
    }

    pub fn get_all_env(&self) -> std::collections::HashMap<String, Value> {
        self.env.get_all()
    }

    pub fn run(&mut self, program: &Program) -> Result<(), FluxError> {
        for statement in &program.statements {
            match self.execute(statement)? {
                Flow::Normal => {}
                Flow::Return(_) => return Err(FluxError::runtime("return used outside function")),
                Flow::Break => return Err(FluxError::runtime("break used outside loop")),
                Flow::Continue => return Err(FluxError::runtime("next used outside loop")),
                Flow::Throw(value) => {
                    return Err(FluxError::runtime(format!("unhandled throw: {value}")))
                }
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
                        flow @ Flow::Throw(_) => return Ok(flow),
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
                        flow @ Flow::Throw(_) => return Ok(flow),
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

            Stmt::Try {
                body,
                catches,
                finally_body,
                ..
            } => {
                let result = self.execute_block(body);
                match result {
                    Ok(flow) => {
                        if let Flow::Throw(error_value) = flow {
                            let mut caught = false;
                            if let Some(catch) = catches.first() {
                                self.env.push_scope();
                                if let Some(name) = &catch.error_name {
                                    self.env.define(name, error_value.clone());
                                }
                                let catch_result = self.execute_block(&catch.body);
                                self.env.pop_scope();
                                match catch_result {
                                    Ok(Flow::Normal) => {
                                        caught = true;
                                    }
                                    Ok(flow) => return Ok(flow),
                                    Err(err) => return Err(err),
                                }
                            }
                            if !caught && !catches.is_empty() {
                                return Ok(Flow::Throw(error_value));
                            }
                        }
                    }
                    Err(err) => {
                        if catches.is_empty() {
                            if let Some(finally) = finally_body {
                                self.execute_block(finally)?;
                            }
                            return Err(err);
                        }
                        let error_value = Value::Text(err.to_string());
                        let mut caught = false;
                        if let Some(catch) = catches.first() {
                            self.env.push_scope();
                            if let Some(name) = &catch.error_name {
                                self.env.define(name, error_value.clone());
                            }
                            let catch_result = self.execute_block(&catch.body);
                            self.env.pop_scope();
                            match catch_result {
                                Ok(Flow::Normal) => {
                                    caught = true;
                                }
                                Ok(flow) => return Ok(flow),
                                Err(err) => return Err(err),
                            }
                        }
                        if !caught {
                            if let Some(finally) = finally_body {
                                self.execute_block(finally)?;
                            }
                            return Err(FluxError::runtime(error_value.to_string()));
                        }
                    }
                }
                if let Some(finally) = finally_body {
                    self.execute_block(finally)?;
                }
            }

            Stmt::Throw(expr) => {
                let value = self.evaluate(expr)?;
                return Ok(Flow::Throw(value));
            }

            Stmt::Use { path, alias } => {
                let module = self.load_module(path)?;
                if let Some(alias_name) = alias {
                    self.env.define(alias_name, Value::Module(module));
                } else {
                    let members = module.clone();
                    for (name, value) in &members {
                        self.env.define(name, value.clone());
                    }
                }
            }

            Stmt::UseFrom { path, names } => {
                let module = self.load_module(path)?;
                for name in names {
                    let value = module.get(name).cloned().unwrap_or(Value::Nothing);
                    self.env.define(name, value);
                }
            }

            Stmt::Export { name } => {
                let _ = self.env.get(name);
            }

            Stmt::Pick {
                expression,
                cases,
                else_case,
            } => {
                let value = self.evaluate(expression)?;
                let mut matched = false;
                for case in cases {
                    let pattern = self.evaluate(&case.pattern)?;
                    if value == pattern {
                        matched = true;
                        match self.execute_block(&case.body)? {
                            Flow::Normal => {}
                            flow => return Ok(flow),
                        }
                        break;
                    }
                }
                if !matched {
                    if let Some(else_body) = else_case {
                        match self.execute_block(else_body)? {
                            Flow::Normal => {}
                            flow => return Ok(flow),
                        }
                    }
                }
            }

            Stmt::Let {
                name,
                type_hint: _,
                expr,
            } => {
                let value = self.evaluate(expr)?;
                self.env.define(name, value);
            }

            Stmt::Const {
                name,
                type_hint: _,
                expr,
            } => {
                let value = self.evaluate(expr)?;
                self.env.define_const(name.clone(), value);
            }

            Stmt::Struct { name, fields } => {
                let mut struct_obj = BTreeMap::new();
                struct_obj.insert("type".to_string(), Value::Text("struct".to_string()));
                struct_obj.insert("name".to_string(), Value::Text(name.clone()));
                struct_obj.insert(
                    "fields".to_string(),
                    Value::List(fields.iter().map(|f| Value::Text(f.clone())).collect()),
                );
                self.env.define(name, Value::Object(struct_obj));
            }

            Stmt::Enum { name, variants } => {
                let mut enum_obj = BTreeMap::new();
                enum_obj.insert("type".to_string(), Value::Text("enum".to_string()));
                enum_obj.insert("name".to_string(), Value::Text(name.clone()));
                enum_obj.insert(
                    "variants".to_string(),
                    Value::List(variants.iter().map(|v| Value::Text(v.clone())).collect()),
                );
                self.env.define(name, Value::Object(enum_obj));
            }

            Stmt::Impl {
                struct_name,
                methods,
            } => {
                let _ = struct_name;
                for method in methods {
                    self.execute(method)?;
                }
            }

            Stmt::Loop { body } => loop {
                match self.execute_block(body)? {
                    Flow::Normal => {}
                    Flow::Continue => continue,
                    Flow::Break => break,
                    flow @ Flow::Return(_) => return Ok(flow),
                    flow @ Flow::Throw(_) => return Ok(flow),
                }
            },

            Stmt::While { condition, body } => {
                while self.evaluate(condition)?.is_truthy() {
                    match self.execute_block(body)? {
                        Flow::Normal => {}
                        Flow::Continue => continue,
                        Flow::Break => break,
                        flow @ Flow::Return(_) => return Ok(flow),
                        flow @ Flow::Throw(_) => return Ok(flow),
                    }
                }
            }

            Stmt::Until { condition, body } => loop {
                match self.execute_block(body)? {
                    Flow::Normal => {}
                    Flow::Continue => continue,
                    Flow::Break => break,
                    flow @ Flow::Return(_) => return Ok(flow),
                    flow @ Flow::Throw(_) => return Ok(flow),
                }
                if self.evaluate(condition)?.is_truthy() {
                    break;
                }
            },

            Stmt::Assert { condition, message } => {
                let value = self.evaluate(condition)?;
                if !value.is_truthy() {
                    let msg = if let Some(msg_expr) = message {
                        let msg_val = self.evaluate(msg_expr)?;
                        format!("assertion failed: {msg_val}")
                    } else {
                        "assertion failed".to_string()
                    };
                    return Err(FluxError::runtime(msg));
                }
            }
        }

        Ok(Flow::Normal)
    }

    fn load_module(
        &mut self,
        path: &str,
    ) -> Result<std::collections::HashMap<String, Value>, FluxError> {
        if let Some(module) = self.modules.get(path) {
            return Ok(module.clone());
        }

        let mut module = std::collections::HashMap::new();
        match path {
            "std/math" => {
                module.insert("pi".to_string(), Value::Number(std::f64::consts::PI));
                module.insert("e".to_string(), Value::Number(std::f64::consts::E));
                for name in &[
                    "sqrt", "abs", "floor", "ceil", "round", "min", "max", "pow", "sin", "cos",
                    "tan", "log", "log10", "exp",
                ] {
                    module.insert(name.to_string(), Value::Text(format!("builtin:{name}")));
                }
                module.insert(
                    "random".to_string(),
                    Value::Text("builtin:random".to_string()),
                );
                module.insert(
                    "random_int".to_string(),
                    Value::Text("builtin:random_int".to_string()),
                );
            }
            "std/io" => {
                for name in &[
                    "read_file",
                    "write_file",
                    "append_file",
                    "file_exists",
                    "file_delete",
                    "file_copy",
                    "file_size",
                    "list_dir",
                    "create_dir",
                ] {
                    module.insert(name.to_string(), Value::Text(format!("builtin:{name}")));
                }
            }
            "std/string" => {
                for name in &[
                    "split",
                    "join",
                    "replace",
                    "trim",
                    "upper",
                    "lower",
                    "contains",
                    "starts_with",
                    "ends_with",
                    "find",
                    "atoi",
                    "itoa",
                ] {
                    module.insert(name.to_string(), Value::Text(format!("builtin:{name}")));
                }
            }
            "std/json" => {
                module.insert(
                    "parse".to_string(),
                    Value::Text("builtin:parse_json".to_string()),
                );
                module.insert(
                    "stringify".to_string(),
                    Value::Text("builtin:stringify_json".to_string()),
                );
            }
            "std/os" => {
                for name in &["env", "cwd", "args", "cd", "sleep", "exit", "time"] {
                    module.insert(name.to_string(), Value::Text(format!("builtin:{name}")));
                }
            }
            "std/datetime" => {
                module.insert(
                    "now".to_string(),
                    Value::Text("builtin:date_now".to_string()),
                );
                module.insert(
                    "format".to_string(),
                    Value::Text("builtin:format_date".to_string()),
                );
            }
            "std/types" => {
                for name in &[
                    "is_number",
                    "is_text",
                    "is_bool",
                    "is_list",
                    "is_object",
                    "is_function",
                    "is_nothing",
                    "type_of",
                    "text",
                    "number",
                    "bool",
                ] {
                    module.insert(name.to_string(), Value::Text(format!("builtin:{name}")));
                }
            }
            _ => {
                let ezra_file = format!("{path}.ez");
                let ar_file = format!("{path}.ar"); // legacy extension fallback
                let found = if std::path::Path::new(&ezra_file).exists() {
                    Some(ezra_file)
                } else if std::path::Path::new(&ar_file).exists() {
                    Some(ar_file)
                } else {
                    None
                };
                if let Some(file_path) = found {
                    let source = std::fs::read_to_string(&file_path).map_err(|err| {
                        FluxError::runtime(format!("failed to read module `{path}`: {err}"))
                    })?;
                    let program = parser::parse(&source)?;
                    let mut temp_env = Environment::new();
                    std::mem::swap(&mut self.env, &mut temp_env);
                    self.run(&program)?;
                    std::mem::swap(&mut self.env, &mut temp_env);
                    for (name, value) in temp_env.get_all() {
                        module.insert(name, value);
                    }
                } else {
                    return Err(FluxError::runtime(format!("module `{path}` not found")));
                }
            }
        }

        self.modules.insert(path.to_string(), module.clone());
        Ok(module)
    }

    fn evaluate(&mut self, expr: &Expr) -> Result<Value, FluxError> {
        match expr {
            Expr::ArrowFunction { params, body } => {
                let function = FunctionValue {
                    name: "<arrow>".to_string(),
                    params: params.clone(),
                    body: vec![crate::ast::Stmt::Return(*body.clone())],
                };
                return Ok(Value::Function(Rc::new(function)));
            }
            Expr::Pipe { left, right } => return self.eval_pipe(left, right),
            Expr::OptionalChain { target, property } => {
                return self.eval_optional_chain(target, property)
            }
            Expr::Call { callee, args } => return self.call(callee, args),
            _ => {}
        }
        let chunk = self.compile_expr(expr);
        ExprVM::eval(&chunk.instrs, &mut self.env)
    }

    fn is_builtin_name(&self, name: &str) -> bool {
        const BUILTINS: &[&str] = &[
            "len",
            "type_of",
            "text",
            "number",
            "bool",
            "abs",
            "sqrt",
            "floor",
            "ceil",
            "round",
            "min",
            "max",
            "pow",
            "contains",
            "find",
            "replace",
            "split",
            "join",
            "trim",
            "upper",
            "lower",
            "starts_with",
            "ends_with",
            "map",
            "filter",
            "reduce",
            "sort",
            "reverse",
            "range",
            "keys",
            "values",
            "has",
            "clear",
            "sleep",
            "random",
            "random_int",
            "time",
            "exit",
            "read_file",
            "write_file",
            "append_file",
            "file_exists",
            "file_delete",
            "file_copy",
            "file_size",
            "list_dir",
            "create_dir",
            "parse_json",
            "stringify_json",
            "date_now",
            "format_date",
            "env",
            "cwd",
            "args",
            "cd",
            "sin",
            "cos",
            "tan",
            "log",
            "log10",
            "exp",
            "atoi",
            "itoa",
            "is_number",
            "is_text",
            "is_bool",
            "is_list",
            "is_object",
            "is_function",
            "is_nothing",
            "say",
            "print",
        ];
        BUILTINS.contains(&name)
    }

    fn compile_expr(&mut self, expr: &Expr) -> ExprChunk {
        let mut chunk = ExprChunk::new();
        self.compile_expr_to(expr, &mut chunk);
        chunk
    }

    fn compile_expr_to(&mut self, expr: &Expr, chunk: &mut ExprChunk) {
        match expr {
            Expr::Number(n) => chunk.emit(Instr::Const(Value::Number(*n))),
            Expr::Text(s) => {
                // Simple text, or interpolated? Text expr is always literal (interpolated is separate)
                chunk.emit(Instr::Const(Value::Text(s.clone())));
            }
            Expr::Bool(b) => chunk.emit(Instr::Const(Value::Bool(*b))),
            Expr::Nothing => chunk.emit(Instr::Const(Value::Nothing)),
            Expr::Variable { name, line } => chunk.emit(Instr::Load(name.clone(), *line)),
            Expr::List(items) => {
                for item in items {
                    self.compile_expr_to(item, chunk);
                }
                chunk.emit(Instr::MakeList(items.len()));
            }
            Expr::Object(fields) => {
                for (key, val) in fields {
                    chunk.emit(Instr::Const(Value::Text(key.clone())));
                    self.compile_expr_to(val, chunk);
                }
                chunk.emit(Instr::MakeObject(fields.len()));
            }
            Expr::Input(prompt) => {
                self.compile_expr_to(prompt, chunk);
                chunk.emit(Instr::Input);
            }
            Expr::InputNumber(prompt) => {
                self.compile_expr_to(prompt, chunk);
                chunk.emit(Instr::InputNumber);
            }
            Expr::Unary { op, right } => {
                self.compile_expr_to(right, chunk);
                chunk.emit(match op {
                    UnaryOp::Negate => Instr::Neg,
                    UnaryOp::Not => Instr::Not,
                });
            }
            Expr::Binary { left, op, right } => {
                self.compile_expr_to(left, chunk);
                self.compile_expr_to(right, chunk);
                chunk.emit(match op {
                    BinaryOp::Add => Instr::Add,
                    BinaryOp::Subtract => Instr::Sub,
                    BinaryOp::Multiply => Instr::Mul,
                    BinaryOp::Divide => Instr::Div,
                    BinaryOp::Remainder => Instr::Mod,
                    BinaryOp::Power => Instr::Pow,
                    BinaryOp::Greater => Instr::Gt,
                    BinaryOp::GreaterEqual => Instr::Ge,
                    BinaryOp::Less => Instr::Lt,
                    BinaryOp::LessEqual => Instr::Le,
                    BinaryOp::Equal => Instr::Eq,
                    BinaryOp::NotEqual => Instr::Ne,
                    BinaryOp::And => Instr::And,
                    BinaryOp::Or => Instr::Or,
                    BinaryOp::BitwiseAnd => Instr::BitAnd,
                    BinaryOp::BitwiseOr => Instr::BitOr,
                    BinaryOp::BitwiseXor => Instr::BitXor,
                    BinaryOp::ShiftLeft => Instr::Shl,
                    BinaryOp::ShiftRight => Instr::Shr,
                });
            }
            Expr::Call { callee, args } => {
                if let Expr::Variable { name, .. } = callee.as_ref() {
                    if self.is_builtin_name(name) {
                        for arg in args {
                            self.compile_expr_to(arg, chunk);
                        }
                        chunk.emit(Instr::Builtin(name.clone(), args.len()));
                        return;
                    }
                }
                if let Expr::Property { target, name } = callee.as_ref() {
                    self.compile_expr_to(target, chunk);
                    chunk.emit(Instr::Property(name.clone()));
                    for arg in args {
                        self.compile_expr_to(arg, chunk);
                    }
                    chunk.emit(Instr::Call(args.len()));
                    return;
                }
                self.compile_expr_to(callee, chunk);
                for arg in args {
                    self.compile_expr_to(arg, chunk);
                }
                chunk.emit(Instr::Call(args.len()));
            }
            Expr::Index { target, index } => {
                self.compile_expr_to(target, chunk);
                self.compile_expr_to(index, chunk);
                chunk.emit(Instr::Index);
            }
            Expr::Property { target, name } => {
                self.compile_expr_to(target, chunk);
                chunk.emit(Instr::Property(name.clone()));
            }
            Expr::Grouping(inner) => self.compile_expr_to(inner, chunk),
            Expr::InterpolatedText(parts) => {
                for part in parts {
                    match part {
                        crate::ast::TextPart::Literal(s) => {
                            chunk.emit(Instr::Const(Value::Text(s.clone())));
                        }
                        crate::ast::TextPart::Interpolation(inner) => {
                            self.compile_expr_to(inner, chunk);
                        }
                    }
                }
                chunk.emit(Instr::Interpolate(parts.len()));
            }
            Expr::Ternary {
                condition,
                then_expr,
                else_expr,
            } => {
                self.compile_expr_to(condition, chunk);
                self.compile_expr_to(then_expr, chunk);
                self.compile_expr_to(else_expr, chunk);
                chunk.emit(Instr::Ternary);
            }
            Expr::TypeHint { expr, .. } => self.compile_expr_to(expr, chunk),
            Expr::SizeOf(inner) => {
                self.compile_expr_to(inner, chunk);
                chunk.emit(Instr::SizeOf);
            }
            Expr::TypeOf(inner) => {
                self.compile_expr_to(inner, chunk);
                chunk.emit(Instr::TypeOf);
            }
            Expr::Spread(inner) => {
                self.compile_expr_to(inner, chunk);
                chunk.emit(Instr::Expand);
            }
            // ArrowFunction, Pipe, OptionalChain handled directly in evaluate()
            _ => {}
        }
    }

    fn eval_pipe(&mut self, left: &Expr, right: &Expr) -> Result<Value, FluxError> {
        let left_value = self.evaluate(left)?;
        match right {
            Expr::Call { callee, args } => {
                // Prepend left_value as the first argument.
                let mut all_args = vec![left_value];
                for a in args {
                    all_args.push(self.evaluate(a)?);
                }
                match callee.as_ref() {
                    Expr::Variable { name, .. } => {
                        if let Some(result) = self.call_builtin(name, all_args.clone())? {
                            return Ok(result);
                        }
                        // User-defined function
                        let func_val = self.env.get(name).ok_or_else(|| {
                            FluxError::runtime(format!("undefined function `{name}`"))
                        })?;
                        if let Value::Function(f) = func_val {
                            return self.call_function(&f, all_args);
                        }
                        Err(FluxError::runtime(format!("`{name}` is not a function")))
                    }
                    _ => {
                        let f = self.evaluate(callee)?;
                        if let Value::Function(func) = f {
                            self.call_function(&func, all_args)
                        } else {
                            Err(FluxError::runtime("right side of pipe must be a function"))
                        }
                    }
                }
            }
            Expr::Variable { name, .. } => {
                if let Some(result) = self.call_builtin(name, vec![left_value.clone()])? {
                    return Ok(result);
                }
                let func_val = self
                    .env
                    .get(name)
                    .ok_or_else(|| FluxError::runtime(format!("undefined function `{name}`")))?;
                if let Value::Function(f) = func_val {
                    self.call_function(&f, vec![left_value])
                } else {
                    Err(FluxError::runtime(format!("`{name}` is not a function")))
                }
            }
            _ => {
                let right_value = self.evaluate(right)?;
                if let Value::Function(func) = right_value {
                    self.call_function(&func, vec![left_value])
                } else {
                    Err(FluxError::runtime("right side of pipe must be a function"))
                }
            }
        }
    }

    fn eval_optional_chain(&mut self, target: &Expr, property: &str) -> Result<Value, FluxError> {
        let target = self.evaluate(target)?;
        match target {
            Value::Nothing => Ok(Value::Nothing),
            Value::Object(obj) => Ok(obj.get(property).cloned().unwrap_or(Value::Nothing)),
            _ => self.property_value(target, property),
        }
    }

    fn call(&mut self, callee: &Expr, args: &[Expr]) -> Result<Value, FluxError> {
        if let Expr::Variable { name, .. } = callee {
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
        let values = self.evaluate_args(args)?;

        if let Value::Text(func_name) = &callee {
            if func_name.starts_with("builtin:") {
                let builtin_name = func_name.strip_prefix("builtin:").unwrap_or("");
                if let Some(value) = self.call_builtin(builtin_name, values)? {
                    return Ok(value);
                }
            }
            return Err(FluxError::runtime("cannot call text value".to_string()));
        }

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
                values.len()
            )));
        }

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
            Flow::Throw(value) => Err(FluxError::runtime(format!("unhandled throw: {value}"))),
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
            "bool" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(args[0].is_truthy())
            }
            "abs" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("abs requires a number"));
                };
                Value::Number(n.abs())
            }
            "sqrt" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("sqrt requires a number"));
                };
                Value::Number(n.sqrt())
            }
            "floor" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("floor requires a number"));
                };
                Value::Number(n.floor())
            }
            "ceil" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("ceil requires a number"));
                };
                Value::Number(n.ceil())
            }
            "round" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("round requires a number"));
                };
                Value::Number(n.round())
            }
            "min" => {
                expect_arg_count(name, &args, 2)?;
                let (a, b) = expect_numbers(args[0].clone(), args[1].clone())?;
                Value::Number(a.min(b))
            }
            "max" => {
                expect_arg_count(name, &args, 2)?;
                let (a, b) = expect_numbers(args[0].clone(), args[1].clone())?;
                Value::Number(a.max(b))
            }
            "pow" => {
                expect_arg_count(name, &args, 2)?;
                let (base, exp) = expect_numbers(args[0].clone(), args[1].clone())?;
                Value::Number(base.powf(exp))
            }
            "push" => {
                expect_arg_count(name, &args, 2)?;
                let Value::List(mut list) = args[0].clone() else {
                    return Err(FluxError::runtime("push requires a list"));
                };
                list.push(args[1].clone());
                Value::List(list)
            }
            "pop" => {
                expect_arg_count(name, &args, 1)?;
                let Value::List(mut list) = args[0].clone() else {
                    return Err(FluxError::runtime("pop requires a list"));
                };
                list.pop().unwrap_or(Value::Nothing)
            }
            "contains" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::Text(text), Value::Text(pattern)) => {
                        Value::Bool(text.contains(pattern))
                    }
                    (Value::List(list), value) => Value::Bool(list.contains(value)),
                    _ => return Err(FluxError::runtime("contains requires text or list")),
                }
            }
            "find" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::Text(text), Value::Text(pattern)) => {
                        let idx = text.find(pattern).map(|i| i as f64).unwrap_or(-1.0);
                        Value::Number(idx)
                    }
                    _ => return Err(FluxError::runtime("find requires text arguments")),
                }
            }
            "replace" => {
                expect_arg_count(name, &args, 3)?;
                match (&args[0], &args[1], &args[2]) {
                    (Value::Text(text), Value::Text(from), Value::Text(to)) => {
                        Value::Text(text.replace(from, to))
                    }
                    _ => return Err(FluxError::runtime("replace requires text arguments")),
                }
            }
            "split" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::Text(text), Value::Text(delimiter)) => {
                        let parts: Vec<Value> = text
                            .split(delimiter)
                            .map(|s| Value::Text(s.to_string()))
                            .collect();
                        Value::List(parts)
                    }
                    _ => return Err(FluxError::runtime("split requires text arguments")),
                }
            }
            "join" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::List(list), Value::Text(separator)) => {
                        let parts: Vec<String> = list.iter().map(|v| v.to_string()).collect();
                        Value::Text(parts.join(separator))
                    }
                    _ => return Err(FluxError::runtime("join requires list and text")),
                }
            }
            "trim" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Text(text) = &args[0] else {
                    return Err(FluxError::runtime("trim requires text"));
                };
                Value::Text(text.trim().to_string())
            }
            "upper" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Text(text) = &args[0] else {
                    return Err(FluxError::runtime("upper requires text"));
                };
                Value::Text(text.to_uppercase())
            }
            "lower" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Text(text) = &args[0] else {
                    return Err(FluxError::runtime("lower requires text"));
                };
                Value::Text(text.to_lowercase())
            }
            "starts_with" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::Text(text), Value::Text(prefix)) => {
                        Value::Bool(text.starts_with(prefix))
                    }
                    _ => return Err(FluxError::runtime("starts_with requires text arguments")),
                }
            }
            "ends_with" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::Text(text), Value::Text(suffix)) => Value::Bool(text.ends_with(suffix)),
                    _ => return Err(FluxError::runtime("ends_with requires text arguments")),
                }
            }
            "map" => {
                expect_arg_count(name, &args, 2)?;
                let Value::List(list) = &args[0] else {
                    return Err(FluxError::runtime("map requires a list"));
                };
                let Value::Function(func) = &args[1] else {
                    return Err(FluxError::runtime("map requires a function"));
                };
                let mut result = Vec::new();
                for item in list {
                    let mapped = self.call_function(func, vec![item.clone()])?;
                    result.push(mapped);
                }
                Value::List(result)
            }
            "filter" => {
                expect_arg_count(name, &args, 2)?;
                let Value::List(list) = &args[0] else {
                    return Err(FluxError::runtime("filter requires a list"));
                };
                let Value::Function(func) = &args[1] else {
                    return Err(FluxError::runtime("filter requires a function"));
                };
                let mut result = Vec::new();
                for item in list {
                    let keep = self.call_function(func, vec![item.clone()])?;
                    if keep.is_truthy() {
                        result.push(item.clone());
                    }
                }
                Value::List(result)
            }
            "reduce" => {
                expect_arg_count(name, &args, 3)?;
                let Value::List(list) = &args[0] else {
                    return Err(FluxError::runtime("reduce requires a list"));
                };
                let Value::Function(func) = &args[1] else {
                    return Err(FluxError::runtime("reduce requires a function"));
                };
                let mut acc = args[2].clone();
                for item in list {
                    acc = self.call_function(func, vec![acc, item.clone()])?;
                }
                acc
            }
            "sort" => {
                expect_arg_count(name, &args, 1)?;
                let Value::List(mut list) = args[0].clone() else {
                    return Err(FluxError::runtime("sort requires a list"));
                };
                list.sort_by(|a, b| {
                    a.to_string()
                        .partial_cmp(&b.to_string())
                        .unwrap_or(std::cmp::Ordering::Equal)
                });
                Value::List(list)
            }
            "reverse" => {
                expect_arg_count(name, &args, 1)?;
                let Value::List(mut list) = args[0].clone() else {
                    return Err(FluxError::runtime("reverse requires a list"));
                };
                list.reverse();
                Value::List(list)
            }
            "range" => {
                let start;
                let end;
                let step;
                if args.len() == 1 {
                    start = 0.0;
                    let Value::Number(e) = args[0] else {
                        return Err(FluxError::runtime("range requires numbers"));
                    };
                    end = e;
                    step = 1.0;
                } else if args.len() == 2 {
                    let Value::Number(s) = args[0] else {
                        return Err(FluxError::runtime("range requires numbers"));
                    };
                    let Value::Number(e) = args[1] else {
                        return Err(FluxError::runtime("range requires numbers"));
                    };
                    start = s;
                    end = e;
                    step = 1.0;
                } else if args.len() == 3 {
                    let Value::Number(s) = args[0] else {
                        return Err(FluxError::runtime("range requires numbers"));
                    };
                    let Value::Number(e) = args[1] else {
                        return Err(FluxError::runtime("range requires numbers"));
                    };
                    let Value::Number(st) = args[2] else {
                        return Err(FluxError::runtime("range requires numbers"));
                    };
                    start = s;
                    end = e;
                    step = st;
                } else {
                    return Err(FluxError::runtime("range requires 1-3 arguments"));
                };
                let mut result = Vec::new();
                let mut i = start;
                while (step > 0.0 && i < end) || (step < 0.0 && i > end) {
                    result.push(Value::Number(i));
                    i += step;
                }
                Value::List(result)
            }
            "keys" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Object(obj) = &args[0] else {
                    return Err(FluxError::runtime("keys requires an object"));
                };
                let keys: Vec<Value> = obj.keys().map(|k| Value::Text(k.clone())).collect();
                Value::List(keys)
            }
            "values" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Object(obj) = &args[0] else {
                    return Err(FluxError::runtime("values requires an object"));
                };
                let values: Vec<Value> = obj.values().cloned().collect();
                Value::List(values)
            }
            "has" => {
                expect_arg_count(name, &args, 2)?;
                match (&args[0], &args[1]) {
                    (Value::Object(obj), Value::Text(key)) => Value::Bool(obj.contains_key(key)),
                    (Value::List(list), Value::Number(idx)) => {
                        let idx = expect_non_negative_integer(*idx, "index")?;
                        Value::Bool(idx < list.len())
                    }
                    _ => return Err(FluxError::runtime("has requires object or list")),
                }
            }
            "clear" => {
                expect_arg_count(name, &args, 1)?;
                let Value::List(_) = &args[0] else {
                    return Err(FluxError::runtime("clear requires a list"));
                };
                Value::List(Vec::new())
            }
            "sleep" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(ms) = args[0] else {
                    return Err(FluxError::runtime("sleep requires a number"));
                };
                std::thread::sleep(std::time::Duration::from_millis(ms as u64));
                Value::Nothing
            }
            "random" => {
                expect_arg_count(name, &args, 0)?;
                use std::collections::hash_map::RandomState;
                use std::hash::{BuildHasher, Hasher};
                let s = RandomState::new();
                let mut hasher = s.build_hasher();
                hasher.write_u64(
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .map_err(|e| FluxError::runtime(format!("system time error: {e}")))?
                        .as_nanos() as u64,
                );
                let value = hasher.finish() as f64 / u64::MAX as f64;
                Value::Number(value)
            }
            "time" => {
                expect_arg_count(name, &args, 0)?;
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| FluxError::runtime(format!("system time error: {e}")))?
                    .as_secs_f64();
                Value::Number(now)
            }
            "exit" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(code) = args[0] else {
                    return Err(FluxError::runtime("exit requires a number"));
                };
                process::exit(code as i32);
            }

            // --- FILE I/O ---
            "read_file" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                let content = std::fs::read_to_string(&path)
                    .map_err(|e| FluxError::runtime(format!("cannot read file `{path}`: {e}")))?;
                Value::Text(content)
            }
            "write_file" => {
                expect_arg_count(name, &args, 2)?;
                let path = args[0].to_string();
                let content = args[1].to_string();
                std::fs::write(&path, &content)
                    .map_err(|e| FluxError::runtime(format!("cannot write file `{path}`: {e}")))?;
                Value::Nothing
            }
            "append_file" => {
                expect_arg_count(name, &args, 2)?;
                let path = args[0].to_string();
                let content = args[1].to_string();
                use std::io::Write;
                let mut file = std::fs::OpenOptions::new()
                    .append(true)
                    .create(true)
                    .open(&path)
                    .map_err(|e| {
                        FluxError::runtime(format!("cannot append to file `{path}`: {e}"))
                    })?;
                file.write_all(content.as_bytes()).map_err(|e| {
                    FluxError::runtime(format!("cannot write to file `{path}`: {e}"))
                })?;
                Value::Nothing
            }
            "file_exists" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                Value::Bool(std::path::Path::new(&path).exists())
            }
            "file_delete" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                std::fs::remove_file(&path)
                    .map_err(|e| FluxError::runtime(format!("cannot delete file `{path}`: {e}")))?;
                Value::Bool(true)
            }
            "file_copy" => {
                expect_arg_count(name, &args, 2)?;
                let src = args[0].to_string();
                let dst = args[1].to_string();
                std::fs::copy(&src, &dst).map_err(|e| {
                    FluxError::runtime(format!("cannot copy `{src}` to `{dst}`: {e}"))
                })?;
                Value::Nothing
            }
            "file_size" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                let metadata = std::fs::metadata(&path).map_err(|e| {
                    FluxError::runtime(format!("cannot get file size `{path}`: {e}"))
                })?;
                Value::Number(metadata.len() as f64)
            }
            "list_dir" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                let entries = std::fs::read_dir(&path).map_err(|e| {
                    FluxError::runtime(format!("cannot list directory `{path}`: {e}"))
                })?;
                let files: Vec<Value> = entries
                    .filter_map(|e| e.ok())
                    .map(|e| Value::Text(e.file_name().to_string_lossy().to_string()))
                    .collect();
                Value::List(files)
            }
            "create_dir" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                std::fs::create_dir_all(&path).map_err(|e| {
                    FluxError::runtime(format!("cannot create directory `{path}`: {e}"))
                })?;
                Value::Nothing
            }

            // --- JSON ---
            "parse_json" => {
                expect_arg_count(name, &args, 1)?;
                let text = args[0].to_string();

                Self::json_to_value(&text)?
            }
            "stringify_json" => {
                expect_arg_count(name, &args, 1)?;
                let value = Self::value_to_json(&args[0])?;
                Value::Text(value)
            }

            // --- DATE / TIME ---
            "date_now" => {
                expect_arg_count(name, &args, 0)?;
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| FluxError::runtime(format!("system time error: {e}")))?;
                let mut obj = std::collections::BTreeMap::new();
                obj.insert("unix".to_string(), Value::Number(now.as_secs_f64()));
                obj.insert("ms".to_string(), Value::Number(now.as_millis() as f64));
                Value::Object(obj)
            }
            "format_date" => {
                expect_arg_count(name, &args, 1)?;
                let _format = args[0].to_string();
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| FluxError::runtime(format!("system time error: {e}")))?;
                let secs = now.as_secs();
                let days = secs / 86400;
                let hours = (secs % 86400) / 3600;
                let minutes = (secs % 3600) / 60;
                let seconds = secs % 60;
                let result = format!(
                    "{}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
                    1970 + days / 365,
                    (days % 365) / 28 + 1,
                    days % 28 + 1,
                    hours,
                    minutes,
                    seconds
                );
                Value::Text(result)
            }

            // --- OS ---
            "env" => {
                expect_arg_count(name, &args, 1)?;
                let key = args[0].to_string();
                match std::env::var(&key) {
                    Ok(val) => Value::Text(val),
                    Err(_) => Value::Nothing,
                }
            }
            "cwd" => {
                expect_arg_count(name, &args, 0)?;
                match std::env::current_dir() {
                    Ok(path) => Value::Text(path.to_string_lossy().to_string()),
                    Err(_) => Value::Nothing,
                }
            }
            "args" => {
                expect_arg_count(name, &args, 0)?;
                let sys_args: Vec<String> = std::env::args().skip(2).collect();
                let values: Vec<Value> = sys_args.into_iter().map(Value::Text).collect();
                Value::List(values)
            }
            "cd" => {
                expect_arg_count(name, &args, 1)?;
                let path = args[0].to_string();
                std::env::set_current_dir(&path).map_err(|e| {
                    FluxError::runtime(format!("cannot change to directory `{path}`: {e}"))
                })?;
                Value::Nothing
            }

            // --- MORE MATH ---
            "sin" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("sin requires a number"));
                };
                Value::Number(n.sin())
            }
            "cos" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("cos requires a number"));
                };
                Value::Number(n.cos())
            }
            "tan" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("tan requires a number"));
                };
                Value::Number(n.tan())
            }
            "log" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("log requires a number"));
                };
                Value::Number(n.ln())
            }
            "log10" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("log10 requires a number"));
                };
                Value::Number(n.log10())
            }
            "exp" => {
                expect_arg_count(name, &args, 1)?;
                let Value::Number(n) = args[0] else {
                    return Err(FluxError::runtime("exp requires a number"));
                };
                Value::Number(n.exp())
            }
            "random_int" => {
                expect_arg_count(name, &args, 2)?;
                let Value::Number(min) = args[0] else {
                    return Err(FluxError::runtime("random_int requires numbers"));
                };
                let Value::Number(max) = args[1] else {
                    return Err(FluxError::runtime("random_int requires numbers"));
                };
                let range = (max - min) as u64;
                let hash = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| FluxError::runtime(format!("system time error: {e}")))?
                    .as_nanos() as u64;
                Value::Number((min as u64 + hash % range.max(1)) as f64)
            }
            "atoi" => {
                expect_arg_count(name, &args, 1)?;
                let text = args[0].to_string();
                match text.trim().parse::<f64>() {
                    Ok(n) => Value::Number(n),
                    Err(_) => Value::Nothing,
                }
            }
            "itoa" => {
                expect_arg_count(name, &args, 1)?;
                Value::Text(args[0].to_string())
            }

            // --- TYPE CHECKS ---
            "is_number" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::Number(_)))
            }
            "is_text" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::Text(_)))
            }
            "is_bool" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::Bool(_)))
            }
            "is_list" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::List(_)))
            }
            "is_object" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::Object(_)))
            }
            "is_function" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::Function(_)))
            }
            "is_nothing" => {
                expect_arg_count(name, &args, 1)?;
                Value::Bool(matches!(args[0], Value::Nothing))
            }

            _ => return Ok(None),
        };
        Ok(Some(value))
    }

    /// Simple JSON parser — converts JSON string to Value
    fn json_to_value(json: &str) -> Result<Value, FluxError> {
        let json = json.trim();
        if json.starts_with('"') {
            let inner = &json[1..json.len().saturating_sub(1)];
            Ok(Value::Text(
                inner.replace("\\\"", "\"").replace("\\n", "\n"),
            ))
        } else if json == "true" {
            Ok(Value::Bool(true))
        } else if json == "false" {
            Ok(Value::Bool(false))
        } else if json == "null" {
            Ok(Value::Nothing)
        } else if json.starts_with('[') {
            let inner = json.trim_start_matches('[').trim_end_matches(']');
            if inner.trim().is_empty() {
                return Ok(Value::List(Vec::new()));
            }
            let items = Self::split_json_commas(inner);
            let mut list = Vec::new();
            for item in items {
                list.push(Self::json_to_value(item.trim())?);
            }
            Ok(Value::List(list))
        } else if json.starts_with('{') {
            let inner = json.trim_start_matches('{').trim_end_matches('}');
            if inner.trim().is_empty() {
                return Ok(Value::Object(std::collections::BTreeMap::new()));
            }
            let items = Self::split_json_commas(inner);
            let mut obj = std::collections::BTreeMap::new();
            for item in items {
                let item = item.trim();
                if let Some((key, val)) = item.split_once(':') {
                    let k = key.trim().trim_matches('"').to_string();
                    let v = Self::json_to_value(val.trim())?;
                    obj.insert(k, v);
                }
            }
            Ok(Value::Object(obj))
        } else if json.contains('.') || json.chars().any(|c| c.is_ascii_digit()) {
            json.parse::<f64>()
                .map(Value::Number)
                .map_err(|_| FluxError::runtime(format!("invalid JSON number: `{json}`")))
        } else {
            Err(FluxError::runtime(format!("invalid JSON: `{json}`")))
        }
    }

    fn split_json_commas(s: &str) -> Vec<String> {
        let mut depth = 0usize;
        let mut in_str = false;
        let mut parts = Vec::new();
        let mut current = String::new();
        for ch in s.chars() {
            match ch {
                '"' => in_str = !in_str,
                '{' | '[' if !in_str => depth += 1,
                '}' | ']' if !in_str => depth = depth.saturating_sub(1),
                ',' if depth == 0 && !in_str => {
                    parts.push(current.clone());
                    current.clear();
                    continue;
                }
                _ => {}
            }
            current.push(ch);
        }
        if !current.is_empty() {
            parts.push(current);
        }
        parts
    }

    /// Simple JSON stringifier — converts Value to JSON string
    fn value_to_json(value: &Value) -> Result<String, FluxError> {
        match value {
            Value::Number(n) => {
                if n.fract() == 0.0 {
                    Ok(format!("{}", *n as i64))
                } else {
                    Ok(format!("{n}"))
                }
            }
            Value::Text(t) => Ok(format!(
                "\"{}\"",
                t.replace('"', "\\\"").replace('\n', "\\n")
            )),
            Value::Bool(true) => Ok("true".to_string()),
            Value::Bool(false) => Ok("false".to_string()),
            Value::Nothing => Ok("null".to_string()),
            Value::List(list) => {
                let items: Result<Vec<String>, _> = list.iter().map(Self::value_to_json).collect();
                Ok(format!("[{}]", items?.join(", ")))
            }
            Value::Object(obj) => {
                let items: Result<Vec<String>, _> = obj
                    .iter()
                    .map(|(k, v)| Ok(format!("\"{k}\": {}", Self::value_to_json(v)?)))
                    .collect();
                Ok(format!("{{{}}}", items?.join(", ")))
            }
            Value::Function(_) => Ok("\"<function>\"".to_string()),
            Value::Module(_) => Ok("\"<module>\"".to_string()),
            Value::CompiledFn(_) => Ok("\"<function>\"".to_string()),
        }
    }

    fn call_function(
        &mut self,
        func: &FunctionValue,
        args: Vec<Value>,
    ) -> Result<Value, FluxError> {
        if func.params.len() != args.len() {
            return Err(FluxError::runtime(format!(
                "function `{}` expected {} arguments, got {}",
                func.name,
                func.params.len(),
                args.len()
            )));
        }

        self.env.push_scope();
        for (param, value) in func.params.iter().zip(args) {
            self.env.define(param, value);
        }
        let result = self.execute_block(&func.body);
        self.env.pop_scope();

        match result? {
            Flow::Return(value) => Ok(value),
            Flow::Normal => Ok(Value::Nothing),
            Flow::Break => Err(FluxError::runtime("break used outside loop")),
            Flow::Continue => Err(FluxError::runtime("next used outside loop")),
            Flow::Throw(value) => Err(FluxError::runtime(format!("unhandled throw: {value}"))),
        }
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
            (Value::Text(text), "split") => {
                expect_arg_count(name, &args, 1)?;
                let delimiter = args[0].to_string();
                let parts: Vec<Value> = text
                    .split(&delimiter)
                    .map(|s| Value::Text(s.to_string()))
                    .collect();
                Ok(Value::List(parts))
            }
            (Value::Text(text), "replace") => {
                expect_arg_count(name, &args, 2)?;
                let from = args[0].to_string();
                let to = args[1].to_string();
                Ok(Value::Text(text.replace(&from, &to)))
            }
            (Value::Text(text), "starts_with") => {
                expect_arg_count(name, &args, 1)?;
                Ok(Value::Bool(text.starts_with(&args[0].to_string())))
            }
            (Value::Text(text), "ends_with") => {
                expect_arg_count(name, &args, 1)?;
                Ok(Value::Bool(text.ends_with(&args[0].to_string())))
            }
            (Value::Text(text), "find") => {
                expect_arg_count(name, &args, 1)?;
                let pattern = args[0].to_string();
                let idx = text.find(&pattern).map(|i| i as f64).unwrap_or(-1.0);
                Ok(Value::Number(idx))
            }
            (Value::Text(text), "chars") => {
                expect_arg_count(name, &args, 0)?;
                let chars: Vec<Value> = text.chars().map(|c| Value::Text(c.to_string())).collect();
                Ok(Value::List(chars))
            }
            (Value::Text(text), "parse_number") => {
                expect_arg_count(name, &args, 0)?;
                let num = text
                    .trim()
                    .parse::<f64>()
                    .map_err(|_| FluxError::runtime(format!("cannot parse `{text}` as number")))?;
                Ok(Value::Number(num))
            }
            (Value::List(values), "push") => {
                expect_arg_count(name, &args, 1)?;
                let mut values = values;
                values.push(args[0].clone());
                Ok(Value::List(values))
            }
            (Value::List(values), "pop") => {
                expect_arg_count(name, &args, 0)?;
                let mut values = values;
                values.pop();
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
            (Value::List(values), "sort") => {
                expect_arg_count(name, &args, 0)?;
                let mut values = values;
                values.sort_by(|a, b| {
                    a.to_string()
                        .partial_cmp(&b.to_string())
                        .unwrap_or(std::cmp::Ordering::Equal)
                });
                Ok(Value::List(values))
            }
            (Value::List(values), "reverse") => {
                expect_arg_count(name, &args, 0)?;
                let mut values = values;
                values.reverse();
                Ok(Value::List(values))
            }
            (Value::List(values), "map") => {
                expect_arg_count(name, &args, 1)?;
                let Value::Function(func) = &args[0] else {
                    return Err(FluxError::runtime("map requires a function"));
                };
                let mut result = Vec::new();
                for item in values {
                    let mapped = self.call_function(func, vec![item])?;
                    result.push(mapped);
                }
                Ok(Value::List(result))
            }
            (Value::List(values), "filter") => {
                expect_arg_count(name, &args, 1)?;
                let Value::Function(func) = &args[0] else {
                    return Err(FluxError::runtime("filter requires a function"));
                };
                let mut result = Vec::new();
                for item in values {
                    let keep = self.call_function(func, vec![item.clone()])?;
                    if keep.is_truthy() {
                        result.push(item);
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(values), "reduce") => {
                expect_arg_count(name, &args, 2)?;
                let Value::Function(func) = &args[0] else {
                    return Err(FluxError::runtime("reduce requires a function"));
                };
                let mut acc = args[1].clone();
                for item in values {
                    acc = self.call_function(func, vec![acc, item])?;
                }
                Ok(acc)
            }
            (Value::List(values), "find") => {
                expect_arg_count(name, &args, 1)?;
                let Value::Function(func) = &args[0] else {
                    return Err(FluxError::runtime("find requires a function"));
                };
                for item in &values {
                    let result = self.call_function(func, vec![item.clone()])?;
                    if result.is_truthy() {
                        return Ok(item.clone());
                    }
                }
                Ok(Value::Nothing)
            }
            (Value::List(values), "index") => {
                expect_arg_count(name, &args, 1)?;
                let target = &args[0];
                for (i, item) in values.iter().enumerate() {
                    if item == target {
                        return Ok(Value::Number(i as f64));
                    }
                }
                Ok(Value::Number(-1.0))
            }
            (Value::List(values), "unique") => {
                expect_arg_count(name, &args, 0)?;
                let mut seen = std::collections::HashSet::new();
                let mut result = Vec::new();
                for item in values {
                    let key = item.to_string();
                    if seen.insert(key) {
                        result.push(item);
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(values), "flatten") => {
                expect_arg_count(name, &args, 0)?;
                let mut result = Vec::new();
                for item in values {
                    if let Value::List(inner) = item {
                        result.extend(inner);
                    } else {
                        result.push(item);
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(values), "sum") => {
                expect_arg_count(name, &args, 0)?;
                let sum: f64 = values
                    .iter()
                    .map(|v| match v {
                        Value::Number(n) => Ok(*n),
                        _ => Err(FluxError::runtime("sum requires numbers")),
                    })
                    .collect::<Result<Vec<_>, _>>()?
                    .iter()
                    .sum();
                Ok(Value::Number(sum))
            }
            (Value::List(values), "avg") => {
                expect_arg_count(name, &args, 0)?;
                if values.is_empty() {
                    return Ok(Value::Number(0.0));
                }
                let sum: f64 = values
                    .iter()
                    .map(|v| match v {
                        Value::Number(n) => Ok(*n),
                        _ => Err(FluxError::runtime("avg requires numbers")),
                    })
                    .collect::<Result<Vec<_>, _>>()?
                    .iter()
                    .sum();
                Ok(Value::Number(sum / values.len() as f64))
            }
            (Value::Object(object), "keys") => {
                expect_arg_count(name, &args, 0)?;
                let keys: Vec<Value> = object.keys().map(|k| Value::Text(k.clone())).collect();
                Ok(Value::List(keys))
            }
            (Value::Object(object), "values") => {
                expect_arg_count(name, &args, 0)?;
                let values: Vec<Value> = object.values().cloned().collect();
                Ok(Value::List(values))
            }
            (Value::Object(object), "has") => {
                expect_arg_count(name, &args, 1)?;
                let Value::Text(key) = &args[0] else {
                    return Err(FluxError::runtime("has requires text key"));
                };
                Ok(Value::Bool(object.contains_key(key)))
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
            BinaryOp::Power => {
                let (a, b) = expect_numbers(left, right)?;
                Ok(Value::Number(a.powf(b)))
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
            BinaryOp::BitwiseAnd => {
                let (a, b) = expect_numbers(left, right)?;
                Ok(Value::Number((a as i64 & b as i64) as f64))
            }
            BinaryOp::BitwiseOr => {
                let (a, b) = expect_numbers(left, right)?;
                Ok(Value::Number((a as i64 | b as i64) as f64))
            }
            BinaryOp::BitwiseXor => {
                let (a, b) = expect_numbers(left, right)?;
                Ok(Value::Number((a as i64 ^ b as i64) as f64))
            }
            BinaryOp::ShiftLeft => {
                let (a, b) = expect_numbers(left, right)?;
                Ok(Value::Number(((a as i64) << (b as i64)) as f64))
            }
            BinaryOp::ShiftRight => {
                let (a, b) = expect_numbers(left, right)?;
                Ok(Value::Number(((a as i64) >> (b as i64)) as f64))
            }
        }
    }

    #[allow(dead_code)]
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

    #[allow(dead_code)]
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

use crate::ast::{BinaryOp, CompoundOp, Expr, Stmt, TextPart, UnaryOp};
use crate::bytecode::*;
use crate::environment::Environment;
use crate::error::EzraError as FluxError;
use crate::value::*;
use std::collections::BTreeMap;

// ---------------------------------------------------------------------------
// Runtime data structures
// ---------------------------------------------------------------------------

#[allow(dead_code)]
struct Frame {
    ip: usize,
    stack_top: usize,
    scope_depth: usize,
}

/// A pending try-catch handler.
#[allow(dead_code)]
struct TryHandler {
    catch_ip: usize,
    finally_ip: Option<usize>,
    stack_top: usize,
    scope_depth: usize,
    line: usize,
}

/// Loop context: break-target IP and continue-target IP.
/// Stored so the runtime can find them without side tables.
struct LoopFrame {
    break_ip: usize,
    continue_ip: usize,
}

/// What `exec_instr` should do next.
enum Action {
    Continue,
    Halt,
    BreakLoop,
    NextLoop,
    Return,
    ReturnVal(Value),
    Throw(Value),
}

// ---------------------------------------------------------------------------
// FastVM struct
// ---------------------------------------------------------------------------

pub struct FastVM {
    prog: Program,
    stack: Vec<Value>,
    env: Environment,
    frames: Vec<Frame>,
    /// Loop stack – each active loop pushes one entry. Break/Next use the top.
    loop_stack: Vec<LoopFrame>,
    /// Try-handler stack.
    try_handlers: Vec<TryHandler>,
    /// Scope depth counter (mirrors env.scopes.len() - 1).
    scope_depth: usize,
    rng_state: u64,
}

impl Default for FastVM {
    fn default() -> Self {
        Self::new()
    }
}

impl FastVM {
    pub fn new() -> Self {
        FastVM {
            prog: Program::new(),
            stack: vec![],
            env: Environment::new(),
            frames: vec![],
            loop_stack: vec![],
            try_handlers: vec![],
            scope_depth: 0,
            rng_state: seed_rng_state(),
        }
    }

    pub fn compile_and_run(&mut self, program: &crate::ast::Program) -> Result<(), FluxError> {
        self.compile(program)?;
        self.run()
    }

    fn compile(&mut self, program: &crate::ast::Program) -> Result<(), FluxError> {
        let mut p = Program::new();
        self.compile_stmts(&program.statements, &mut p)?;
        p.emit(Instr::Halt);
        self.prog = p;
        Ok(())
    }

    // -----------------------------------------------------------------------
    // Compilation helpers
    // -----------------------------------------------------------------------

    fn compile_stmts(&mut self, stmts: &[Stmt], p: &mut Program) -> Result<(), FluxError> {
        for s in stmts {
            self.compile_stmt(s, p)?;
        }
        Ok(())
    }

    fn patch(&self, p: &mut Program, pos: usize) -> Result<(), FluxError> {
        let off = p.instrs.len();
        match p.instrs.get_mut(pos) {
            Some(Instr::Jump(ref mut o)) => {
                *o = off;
                Ok(())
            }
            Some(Instr::JumpIfFalse(ref mut o)) => {
                *o = off;
                Ok(())
            }
            Some(Instr::JumpIfTrue(ref mut o)) => {
                *o = off;
                Ok(())
            }
            _ => Err(FluxError::runtime(format!(
                "internal compiler error: bad jump patch at instruction {pos}"
            ))),
        }
    }

    fn emit_jump(&self, instr: Instr, p: &mut Program) -> usize {
        let pos = p.instrs.len();
        p.emit(instr);
        pos
    }

    // -----------------------------------------------------------------------
    // Statement compilation
    // -----------------------------------------------------------------------

    fn compile_stmt(&mut self, stmt: &Stmt, p: &mut Program) -> Result<(), FluxError> {
        match stmt {
            Stmt::Say(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Builtin("say".into(), 1));
                p.emit(Instr::Pop);
            }
            Stmt::Write(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Builtin("write".into(), 1));
                p.emit(Instr::Pop);
            }
            Stmt::Warn(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Builtin("warn".into(), 1));
                p.emit(Instr::Pop);
            }
            Stmt::Fail(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Builtin("fail".into(), 1));
                p.emit(Instr::Pop);
            }
            Stmt::Debug(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Builtin("debug".into(), 1));
                p.emit(Instr::Pop);
            }
            Stmt::Clear => {
                p.emit(Instr::Builtin("clear_screen".into(), 0));
            }
            Stmt::Exit(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Builtin("exit".into(), 1));
            }
            Stmt::Assign { name, expr } => {
                self.compile_expr(expr, p)?;
                p.emit(Instr::Assign(name.clone()));
            }
            Stmt::CompoundAssign { name, op, expr } => {
                // FIX: load current value FIRST, then compile rhs, then apply op.
                // Previously rhs was pushed first, causing a-b = b-a for Sub/Div.
                p.emit(Instr::Load(name.clone(), 0));
                self.compile_expr(expr, p)?;
                let bin = match op {
                    CompoundOp::Add => Instr::Add,
                    CompoundOp::Subtract => Instr::Sub,
                    CompoundOp::Multiply => Instr::Mul,
                    CompoundOp::Divide => Instr::Div,
                };
                p.emit(bin);
                p.emit(Instr::Assign(name.clone()));
            }
            Stmt::Check {
                condition,
                then_branch,
                else_branch,
            } => {
                self.compile_expr(condition, p)?;
                let else_jmp = self.emit_jump(Instr::JumpIfFalse(0), p);
                self.compile_stmts(then_branch, p)?;
                if else_branch.is_empty() {
                    self.patch(p, else_jmp)?;
                } else {
                    let end_jmp = self.emit_jump(Instr::Jump(0), p);
                    self.patch(p, else_jmp)?;
                    self.compile_stmts(else_branch, p)?;
                    self.patch(p, end_jmp)?;
                }
            }
            Stmt::Return(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::RetVal);
            }
            Stmt::Break => {
                p.emit(Instr::Break);
            }
            Stmt::Next => {
                p.emit(Instr::Next);
            }
            Stmt::Expr(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Pop);
            }
            Stmt::Let { name, expr, .. } => {
                self.compile_expr(expr, p)?;
                p.emit(Instr::Store(name.clone()));
            }
            Stmt::Const { name, expr, .. } => {
                self.compile_expr(expr, p)?;
                p.emit(Instr::StoreConst(name.clone()));
            }
            Stmt::Assert { condition, message } => {
                self.compile_expr(condition, p)?;
                if let Some(msg) = message {
                    self.compile_expr(msg, p)?;
                } else {
                    p.emit(Instr::Const(Value::Text(String::new())));
                }
                p.emit(Instr::Assert);
            }
            Stmt::Throw(e) => {
                self.compile_expr(e, p)?;
                p.emit(Instr::Throw);
            }
            // ------------------------------------------------------------------
            // Loops: compile EnterLoop/ExitLoop markers so the runtime can push
            // LoopFrame entries without side tables.
            // ------------------------------------------------------------------
            Stmt::Loop { body } => {
                let start = p.instrs.len();
                p.emit(Instr::EnterLoop(0, start)); // continue = start
                p.emit(Instr::PushScope);
                self.compile_stmts(body, p)?;
                p.emit(Instr::PopScope);
                p.emit(Instr::Jump(start));
                let break_ip = p.instrs.len();
                p.emit(Instr::ExitLoop);
                if let Instr::EnterLoop(ref mut b, _) = p.instrs[start] {
                    *b = break_ip;
                }
            }
            Stmt::While { condition, body } => {
                let start = p.instrs.len();
                p.emit(Instr::EnterLoop(0, start)); // continue = re-evaluate condition
                self.compile_expr(condition, p)?;
                let exit_jmp = self.emit_jump(Instr::JumpIfFalse(0), p);
                p.emit(Instr::PushScope);
                self.compile_stmts(body, p)?;
                p.emit(Instr::PopScope);
                p.emit(Instr::Jump(start));
                self.patch(p, exit_jmp)?;
                let break_ip = p.instrs.len();
                p.emit(Instr::ExitLoop);
                if let Instr::EnterLoop(ref mut b, _) = p.instrs[start] {
                    *b = break_ip;
                }
            }
            Stmt::Until { condition, body } => {
                let start = p.instrs.len();
                p.emit(Instr::EnterLoop(0, start));
                p.emit(Instr::PushScope);
                self.compile_stmts(body, p)?;
                p.emit(Instr::PopScope);
                self.compile_expr(condition, p)?;
                let exit_jmp = self.emit_jump(Instr::JumpIfTrue(0), p);
                p.emit(Instr::Jump(start));
                self.patch(p, exit_jmp)?;
                let break_ip = p.instrs.len();
                p.emit(Instr::ExitLoop);
                if let Instr::EnterLoop(ref mut b, _) = p.instrs[start] {
                    *b = break_ip;
                }
            }
            Stmt::RepeatTimes { count, body } => {
                let cname = "__c".to_string();
                let iname = "__i".to_string();
                self.compile_expr(count, p)?;
                // Validate: count >= 0
                p.emit(Instr::Dup);
                p.emit(Instr::Const(Value::Number(0.0)));
                p.emit(Instr::Lt);
                let ok1 = self.emit_jump(Instr::JumpIfFalse(0), p);
                p.emit(Instr::Const(Value::Text(
                    "repeat count must be a non-negative integer".into(),
                )));
                p.emit(Instr::Throw);
                self.patch(p, ok1)?;
                // Validate: count is integer
                p.emit(Instr::Dup);
                p.emit(Instr::Const(Value::Number(1.0)));
                p.emit(Instr::Mod);
                p.emit(Instr::Const(Value::Number(0.0)));
                p.emit(Instr::Ne);
                let ok2 = self.emit_jump(Instr::JumpIfFalse(0), p);
                p.emit(Instr::Const(Value::Text(
                    "repeat count must be a non-negative integer".into(),
                )));
                p.emit(Instr::Throw);
                self.patch(p, ok2)?;
                p.emit(Instr::Store(cname.clone()));
                p.emit(Instr::Const(Value::Number(0.0)));
                p.emit(Instr::Store(iname.clone()));
                let start = p.instrs.len();
                p.emit(Instr::EnterLoop(0, 0)); // break and continue patched below
                p.emit(Instr::Load(iname.clone(), 0));
                p.emit(Instr::Load(cname.clone(), 0));
                p.emit(Instr::Lt);
                let exit = self.emit_jump(Instr::JumpIfFalse(0), p);
                p.emit(Instr::PushScope);
                self.compile_stmts(body, p)?;
                p.emit(Instr::PopScope);
                // Increment section — this is where `next` should jump.
                let continue_ip = p.instrs.len();
                p.emit(Instr::Load(iname.clone(), 0));
                p.emit(Instr::Const(Value::Number(1.0)));
                p.emit(Instr::Add);
                p.emit(Instr::Store(iname.clone()));
                p.emit(Instr::Jump(start));
                self.patch(p, exit)?;
                let break_ip = p.instrs.len();
                p.emit(Instr::ExitLoop);
                if let Instr::EnterLoop(ref mut b, ref mut c) = p.instrs[start] {
                    *b = break_ip;
                    *c = continue_ip;
                }
            }
            Stmt::ForEach {
                item,
                collection,
                body,
            } => {
                let lname = "__l".to_string();
                let iname = "__fi".to_string();
                self.compile_expr(collection, p)?;
                p.emit(Instr::Store(lname.clone()));
                p.emit(Instr::Const(Value::Number(0.0)));
                p.emit(Instr::Store(iname.clone()));
                let start = p.instrs.len();
                p.emit(Instr::EnterLoop(0, 0));
                p.emit(Instr::Load(iname.clone(), 0));
                p.emit(Instr::Load(lname.clone(), 0));
                p.emit(Instr::SizeOf);
                p.emit(Instr::Lt);
                let exit = self.emit_jump(Instr::JumpIfFalse(0), p);
                p.emit(Instr::Load(lname.clone(), 0));
                p.emit(Instr::Load(iname.clone(), 0));
                p.emit(Instr::Index);
                p.emit(Instr::Store(item.clone()));
                p.emit(Instr::PushScope);
                self.compile_stmts(body, p)?;
                p.emit(Instr::PopScope);
                // Increment — where `next` should jump.
                let continue_ip = p.instrs.len();
                p.emit(Instr::Load(iname.clone(), 0));
                p.emit(Instr::Const(Value::Number(1.0)));
                p.emit(Instr::Add);
                p.emit(Instr::Store(iname.clone()));
                p.emit(Instr::Jump(start));
                self.patch(p, exit)?;
                let break_ip = p.instrs.len();
                p.emit(Instr::ExitLoop);
                if let Instr::EnterLoop(ref mut b, ref mut c) = p.instrs[start] {
                    *b = break_ip;
                    *c = continue_ip;
                }
            }
            Stmt::Function { name, params, body } => {
                // Compile function body into a separate instruction slice.
                let mut fp = Program::new();
                fp.emit(Instr::PushScope);
                // Parameters are popped from caller stack in order.
                for param in params {
                    fp.emit(Instr::Store(param.clone()));
                }
                let saved_breaks = std::mem::take(&mut self.loop_stack);
                let compile_result = self.compile_stmts(body, &mut fp);
                self.loop_stack = saved_breaks;
                compile_result?;
                fp.emit(Instr::Ret);
                let f = CompiledFunc {
                    name: name.clone(),
                    params: params.clone(),
                    instrs: fp.instrs,
                };
                let idx = p.add_func(f);
                p.emit(Instr::MakeFunc(idx));
                p.emit(Instr::Store(name.clone()));
            }
            Stmt::Try {
                body,
                catches,
                finally_body,
                line,
            } => {
                // EnterTry(catch_ip, finally_ip)
                let enter_pos = p.instrs.len();
                p.emit(Instr::EnterTry(0, 0, *line));
                self.compile_stmts(body, p)?;
                // Normal completion: jump over catch + finally
                let skip_catch = self.emit_jump(Instr::Jump(0), p);
                // --- catch section ---
                let catch_ip = p.instrs.len();
                if catches.is_empty() {
                    // No catch: rethrow
                    p.emit(Instr::Rethrow);
                } else {
                    for c in catches {
                        if let Some(err_name) = &c.error_name {
                            p.emit(Instr::Store(err_name.clone()));
                        } else {
                            p.emit(Instr::Pop);
                        }
                        self.compile_stmts(&c.body, p)?;
                    }
                }
                // After catch, fall into finally (if any) then skip
                let skip_finally = self.emit_jump(Instr::Jump(0), p);
                // --- finally section ---
                let finally_ip = p.instrs.len();
                if let Some(fb) = finally_body {
                    self.compile_stmts(fb, p)?;
                }
                let end_ip = p.instrs.len();
                // Patch the EnterTry instruction
                if let Instr::EnterTry(ref mut c, ref mut f, _) = p.instrs[enter_pos] {
                    *c = catch_ip;
                    *f = finally_ip;
                }
                // Patch skip_catch to land at finally
                if let Instr::Jump(ref mut t) = p.instrs[skip_catch] {
                    *t = finally_ip;
                }
                // Patch skip_finally to land at end
                if let Instr::Jump(ref mut t) = p.instrs[skip_finally] {
                    *t = end_ip;
                }
                p.emit(Instr::EndTry);
            }
            Stmt::Use { path, alias } => {
                p.emit(Instr::Const(Value::Text(path.clone())));
                p.emit(Instr::Builtin("use_module".into(), 1));
                if let Some(a) = alias {
                    p.emit(Instr::Store(a.clone()));
                } else {
                    p.emit(Instr::Pop);
                }
            }
            Stmt::UseFrom { path, names } => {
                p.emit(Instr::Const(Value::Text(path.clone())));
                for n in names {
                    p.emit(Instr::Const(Value::Text(n.clone())));
                }
                p.emit(Instr::Builtin("use_from".into(), 1 + names.len()));
            }
            Stmt::Export { name } => {
                // Export is a module-level annotation; at runtime it marks a name
                // as exported.  We push the value and call the export builtin.
                p.emit(Instr::Const(Value::Text(name.clone())));
                p.emit(Instr::Builtin("export".into(), 1));
                p.emit(Instr::Pop);
            }
            Stmt::Pick {
                expression,
                cases,
                else_case,
            } => {
                self.compile_expr(expression, p)?;
                let mut end_jumps = vec![];
                for case in cases {
                    p.emit(Instr::Dup);
                    self.compile_expr(&case.pattern, p)?;
                    p.emit(Instr::Eq);
                    let next_case = self.emit_jump(Instr::JumpIfFalse(0), p);
                    p.emit(Instr::Pop); // discard matched value
                    self.compile_stmts(&case.body, p)?;
                    end_jumps.push(self.emit_jump(Instr::Jump(0), p));
                    self.patch(p, next_case)?;
                }
                p.emit(Instr::Pop); // discard unmatched value
                if let Some(eb) = else_case {
                    self.compile_stmts(eb, p)?;
                }
                for j in end_jumps {
                    self.patch(p, j)?;
                }
            }
            // -------------------------------------------------------------------
            // Struct / Enum / Impl  (Phase 3 – type definitions)
            // -------------------------------------------------------------------
            Stmt::Struct { name, fields } => {
                // Build an object descriptor: { __type: "struct", __name: name, __fields: [...] }
                p.emit(Instr::Const(Value::Text("__type".into())));
                p.emit(Instr::Const(Value::Text("struct".into())));
                p.emit(Instr::Const(Value::Text("__name".into())));
                p.emit(Instr::Const(Value::Text(name.clone())));
                p.emit(Instr::Const(Value::Text("__fields".into())));
                for f in fields {
                    p.emit(Instr::Const(Value::Text(f.clone())));
                }
                p.emit(Instr::MakeList(fields.len()));
                p.emit(Instr::MakeObject(3));
                p.emit(Instr::Store(name.clone()));
                // Also emit a constructor function that creates instances.
                // The constructor is stored as `name` after the descriptor
                // (overwriting the descriptor – user creates instances via call).
                // We store the descriptor under __struct_<name> for reflection.
                p.emit(Instr::Load(name.clone(), 0));
                p.emit(Instr::Builtin("register_struct".into(), 1));
                p.emit(Instr::Store(name.clone()));
            }
            Stmt::Enum { name, variants } => {
                for v in variants {
                    p.emit(Instr::Const(Value::Text(name.clone())));
                    p.emit(Instr::Const(Value::Text(v.clone())));
                    p.emit(Instr::Builtin("make_enum_variant".into(), 2));
                    // Store each variant as `name.Variant` by convention, and also
                    // store the enum itself as an object.
                    p.emit(Instr::Const(Value::Text(v.clone())));
                }
                p.emit(Instr::MakeObject(variants.len()));
                p.emit(Instr::Store(name.clone()));
            }
            Stmt::Impl {
                struct_name,
                methods,
            } => {
                for method in methods {
                    if let Stmt::Function {
                        name: method_name,
                        params,
                        body,
                    } = method
                    {
                        let mut fp = Program::new();
                        fp.emit(Instr::PushScope);
                        fp.emit(Instr::Store("self".to_string()));
                        for param in params {
                            fp.emit(Instr::Store(param.clone()));
                        }
                        let saved_breaks = std::mem::take(&mut self.loop_stack);
                        let compile_result = self.compile_stmts(body, &mut fp);
                        self.loop_stack = saved_breaks;
                        compile_result?;
                        fp.emit(Instr::Ret);
                        let f = CompiledFunc {
                            name: format!("{struct_name}.{method_name}"),
                            params: {
                                let mut all = vec!["self".to_string()];
                                all.extend(params.clone());
                                all
                            },
                            instrs: fp.instrs,
                        };
                        let idx = p.add_func(f);
                        p.emit(Instr::MakeFunc(idx));
                        p.emit(Instr::Store(format!("{struct_name}.{method_name}")));
                    }
                }
            }
        }
        Ok(())
    }

    // -----------------------------------------------------------------------
    // Expression compilation
    // -----------------------------------------------------------------------

    fn compile_expr(&mut self, expr: &Expr, p: &mut Program) -> Result<(), FluxError> {
        match expr {
            Expr::Number(n) => p.emit(Instr::Const(Value::Number(*n))),
            Expr::Text(s) => p.emit(Instr::Const(Value::Text(s.clone()))),
            Expr::Bool(b) => p.emit(Instr::Const(Value::Bool(*b))),
            Expr::Nothing => p.emit(Instr::Const(Value::Nothing)),
            Expr::Variable { name, line } => p.emit(Instr::Load(name.clone(), *line)),
            Expr::List(items) => {
                for item in items {
                    self.compile_expr(item, p)?;
                }
                p.emit(Instr::MakeList(items.len()));
            }
            Expr::Object(fields) => {
                for (k, v) in fields {
                    p.emit(Instr::Const(Value::Text(k.clone())));
                    self.compile_expr(v, p)?;
                }
                p.emit(Instr::MakeObject(fields.len()));
            }
            Expr::Input(prompt) => {
                self.compile_expr(prompt, p)?;
                p.emit(Instr::Builtin("input".into(), 1));
            }
            Expr::InputNumber(prompt) => {
                self.compile_expr(prompt, p)?;
                p.emit(Instr::Builtin("input_number".into(), 1));
            }
            Expr::Unary { op, right } => {
                self.compile_expr(right, p)?;
                p.emit(match op {
                    UnaryOp::Negate => Instr::Neg,
                    UnaryOp::Not => Instr::Not,
                });
            }
            Expr::Binary { left, op, right } => {
                // Short-circuit `and` / `or` — evaluate right side only when needed.
                match op {
                    BinaryOp::And => {
                        // left && right:
                        //   eval left; if falsy, jump to end (result = no)
                        //   otherwise eval right; result = is right truthy
                        self.compile_expr(left, p)?;
                        p.emit(Instr::Dup);
                        let skip = self.emit_jump(Instr::JumpIfFalse(0), p);
                        p.emit(Instr::Pop); // discard left; result will be bool(right)
                        self.compile_expr(right, p)?;
                        p.emit(Instr::Not);
                        p.emit(Instr::Not); // coerce to bool
                        self.patch(p, skip)?;
                        // At skip target: stack has left (falsy) or bool(right)
                        // Normalise to bool
                        p.emit(Instr::Not);
                        p.emit(Instr::Not);
                        return Ok(());
                    }
                    BinaryOp::Or => {
                        // left || right:
                        //   eval left; if truthy, jump to end (result = yes)
                        //   otherwise eval right; result = is right truthy
                        self.compile_expr(left, p)?;
                        p.emit(Instr::Dup);
                        let skip = self.emit_jump(Instr::JumpIfTrue(0), p);
                        p.emit(Instr::Pop); // discard left
                        self.compile_expr(right, p)?;
                        p.emit(Instr::Not);
                        p.emit(Instr::Not); // coerce to bool
                        self.patch(p, skip)?;
                        p.emit(Instr::Not);
                        p.emit(Instr::Not);
                        return Ok(());
                    }
                    _ => {}
                }
                self.compile_expr(left, p)?;
                self.compile_expr(right, p)?;
                p.emit(match op {
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
                    BinaryOp::And | BinaryOp::Or => unreachable!("handled above"),
                    BinaryOp::BitwiseAnd => Instr::BitAnd,
                    BinaryOp::BitwiseOr => Instr::BitOr,
                    BinaryOp::BitwiseXor => Instr::BitXor,
                    BinaryOp::ShiftLeft => Instr::Shl,
                    BinaryOp::ShiftRight => Instr::Shr,
                });
            }
            Expr::Call { callee, args } => {
                // Method call: obj.method(args)
                if let Expr::Property { target, name } = callee.as_ref() {
                    // push args in order, then the target (self), then dispatch
                    for a in args {
                        self.compile_expr(a, p)?;
                    }
                    self.compile_expr(target, p)?;
                    p.emit(Instr::Builtin(format!(".{name}"), args.len() + 1));
                    return Ok(());
                }
                // Builtin call
                if let Expr::Variable { name, .. } = callee.as_ref() {
                    if self.is_builtin(name) {
                        for a in args {
                            self.compile_expr(a, p)?;
                        }
                        p.emit(Instr::Builtin(name.clone(), args.len()));
                        return Ok(());
                    }
                }
                // User-defined function call: push callee, then args in order
                self.compile_expr(callee, p)?;
                for a in args {
                    self.compile_expr(a, p)?;
                }
                p.emit(Instr::Call(args.len()));
            }
            Expr::Index { target, index } => {
                self.compile_expr(target, p)?;
                self.compile_expr(index, p)?;
                p.emit(Instr::Index);
            }
            Expr::Property { target, name } => {
                self.compile_expr(target, p)?;
                p.emit(Instr::Property(name.clone()));
            }
            Expr::Grouping(inner) => self.compile_expr(inner, p)?,
            Expr::InterpolatedText(parts) => {
                for part in parts {
                    match part {
                        TextPart::Literal(s) => p.emit(Instr::Const(Value::Text(s.clone()))),
                        TextPart::Interpolation(e) => self.compile_expr(e, p)?,
                    }
                }
                p.emit(Instr::Interpolate(parts.len()));
            }
            Expr::ArrowFunction { params, body } => {
                let mut fp = Program::new();
                fp.emit(Instr::PushScope);
                for param in params {
                    fp.emit(Instr::Store(param.clone()));
                }
                self.compile_expr(body, &mut fp)?;
                fp.emit(Instr::RetVal);
                let f = CompiledFunc {
                    name: String::new(),
                    params: params.clone(),
                    instrs: fp.instrs,
                };
                let idx = p.add_func(f);
                p.emit(Instr::MakeFunc(idx));
            }
            Expr::Ternary {
                condition,
                then_expr,
                else_expr,
            } => {
                self.compile_expr(condition, p)?;
                let else_jmp = self.emit_jump(Instr::JumpIfFalse(0), p);
                self.compile_expr(then_expr, p)?;
                let end_jmp = self.emit_jump(Instr::Jump(0), p);
                self.patch(p, else_jmp)?;
                self.compile_expr(else_expr, p)?;
                self.patch(p, end_jmp)?;
            }
            Expr::TypeHint { expr, .. } => self.compile_expr(expr, p)?,
            Expr::SizeOf(inner) => {
                self.compile_expr(inner, p)?;
                p.emit(Instr::SizeOf);
            }
            Expr::TypeOf(inner) => {
                self.compile_expr(inner, p)?;
                p.emit(Instr::TypeOf);
            }
            Expr::Spread(inner) => {
                self.compile_expr(inner, p)?;
                p.emit(Instr::Expand);
            }
            Expr::OptionalChain { target, property } => {
                self.compile_expr(target, p)?;
                p.emit(Instr::Property(property.clone()));
            }
            Expr::Pipe { left, right } => {
                // Evaluate left side first (piped value lands on stack).
                self.compile_expr(left, p)?;
                match right.as_ref() {
                    Expr::Variable { .. } => {
                        // pipe into bare function: f(piped_value)
                        self.compile_expr(right, p)?;
                        p.emit(Instr::Swap);
                        p.emit(Instr::Call(1));
                    }
                    Expr::Call { callee, args } => {
                        // pipe into call: f(a, b) => f(piped_value, a, b)
                        // Push callee, push piped value (already on stack via Swap), push explicit args.
                        self.compile_expr(callee, p)?;
                        p.emit(Instr::Swap); // callee <-> piped_value
                        for a in args {
                            self.compile_expr(a, p)?;
                        }
                        p.emit(Instr::Call(args.len() + 1));
                    }
                    _ => {
                        self.compile_expr(right, p)?;
                        p.emit(Instr::Swap);
                        p.emit(Instr::Call(1));
                    }
                }
            }
        }
        Ok(())
    }

    fn is_builtin(&self, name: &str) -> bool {
        const B: &[&str] = &[
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
            "input",
            "input_number",
            "say",
            "write",
            "warn",
            "fail",
            "debug",
            "clear_screen",
            "stack_new",
            "queue_new",
            "gcd",
            "lcm",
            "is_prime",
            "factorial",
            "fibonacci",
            "pad_left",
            "pad_right",
            "count",
            "to_chars",
            "sort_numbers",
            "sort_by_key",
            "parse_csv",
            "stringify_csv",
            "assert_eq",
            "assert_error",
            "format",
        ];
        B.contains(&name)
    }

    // -----------------------------------------------------------------------
    // Runtime
    // -----------------------------------------------------------------------

    pub fn run(&mut self) -> Result<(), FluxError> {
        self.stack.clear();
        self.env = Environment::new();
        self.frames.clear();
        self.loop_stack.clear();
        self.try_handlers.clear();
        self.scope_depth = 0;
        let instrs = self.prog.instrs.clone();
        self.exec_program(&instrs)
    }

    fn next_random_u64(&mut self) -> u64 {
        let mut x = self.rng_state;
        if x == 0 {
            x = seed_rng_state();
        }
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.rng_state = x;
        x
    }

    fn next_random_f64(&mut self) -> f64 {
        const DENOM: f64 = (u64::MAX as f64) + 1.0;
        (self.next_random_u64() as f64) / DENOM
    }

    fn invoke_compiled_function(
        &mut self,
        idx: usize,
        args: Vec<Value>,
    ) -> Result<Value, FluxError> {
        let params = self.prog.functions[idx].params.clone();
        if args.len() != params.len() {
            let name = self.prog.functions[idx].name.clone();
            return Err(FluxError::runtime(format!(
                "function `{name}` expected {} argument(s), got {}",
                params.len(),
                args.len()
            )));
        }

        // We invoke by pushing a synthetic Call onto the main stack/env of
        // this VM rather than spawning a fresh one.  This ensures RetVal
        // properly returns to our synthetic call frame and the result ends up
        // on self.stack where we can pop it.
        //
        // Save current execution state.
        let saved_stack_len = self.stack.len();
        let saved_scope_depth = self.scope_depth;
        let saved_loop_top = self.loop_stack.len();

        // Push the callee index marker so exec_program can find it via Call,
        // then push args in order (exec_program's Call handler reverses them).
        self.stack.push(Value::CompiledFn(idx));
        for arg in &args {
            self.stack.push(arg.clone());
        }

        // Build a tiny wrapper program: just one Call instruction followed by Halt.
        let wrapper: Vec<Instr> = vec![Instr::Call(args.len()), Instr::Halt];
        let result = self.exec_program(&wrapper);

        // Restore loop stack to its prior state on error.
        if result.is_err() {
            self.loop_stack.truncate(saved_loop_top);
            self.scope_depth = saved_scope_depth;
            self.stack.truncate(saved_stack_len);
            return result.map(|_| Value::Nothing);
        }

        // The return value was pushed onto self.stack by RetVal/Ret.
        let retval = if self.stack.len() > saved_stack_len {
            self.stack.pop().unwrap_or(Value::Nothing)
        } else {
            Value::Nothing
        };

        // Restore scope depth (exec_program manages scopes internally).
        self.scope_depth = saved_scope_depth;
        self.loop_stack.truncate(saved_loop_top);

        Ok(retval)
    }

    fn invoke_value(&mut self, value: Value, args: Vec<Value>) -> Result<Value, FluxError> {
        match value {
            Value::CompiledFn(idx) => self.invoke_compiled_function(idx, args),
            Value::Function(_) => Err(FluxError::runtime("cannot call legacy function in FastVM")),
            Value::Text(text) if text.starts_with("builtin:") => {
                let builtin_name = text.strip_prefix("builtin:").unwrap_or("");
                self.call_builtin(builtin_name, args)
            }
            other => Err(FluxError::runtime(format!(
                "cannot call a {}",
                other.type_name()
            ))),
        }
    }

    /// Main execution loop. Uses an explicit call-frame stack so function
    /// calls never recurse into Rust — they just swap the active instruction
    /// slice.
    fn exec_program(&mut self, main_instrs: &[Instr]) -> Result<(), FluxError> {
        // Each CallFrame holds a snapshot of the instruction slice we came
        // from and the ip to resume at when the callee returns.
        struct CallFrame {
            instrs: Vec<Instr>,
            return_ip: usize,
            stack_top: usize,
            scope_depth: usize,
            loop_stack_top: usize,
        }

        let mut call_stack: Vec<CallFrame> = Vec::new();
        let mut cur_instrs: Vec<Instr> = main_instrs.to_vec();
        let mut ip: usize = 0;

        loop {
            if ip >= cur_instrs.len() {
                // Fell off the end — treat as implicit return.
                if let Some(frame) = call_stack.pop() {
                    while self.scope_depth > frame.scope_depth {
                        self.env.pop_scope();
                        self.scope_depth -= 1;
                    }
                    // Truncate loop stack back to the frame's level.
                    self.loop_stack.truncate(frame.loop_stack_top);
                    self.stack.truncate(frame.stack_top);
                    // No return value — push Nothing.
                    self.stack.push(Value::Nothing);
                    cur_instrs = frame.instrs;
                    ip = frame.return_ip;
                    continue;
                }
                return Ok(());
            }

            let instr = cur_instrs[ip].clone();
            ip += 1;

            match &instr {
                // --- Function call: switch instruction slice ---
                Instr::Call(argc) => {
                    let mut args: Vec<Value> = Vec::with_capacity(*argc);
                    for _ in 0..*argc {
                        args.push(
                            self.stack.pop().ok_or_else(|| {
                                FluxError::runtime("stack underflow on Call args")
                            })?,
                        );
                    }
                    args.reverse();
                    let callee = self
                        .stack
                        .pop()
                        .ok_or_else(|| FluxError::runtime("stack underflow on Call callee"))?;
                    match callee {
                        Value::CompiledFn(idx) => {
                            let func_instrs = self.prog.functions[idx].instrs.clone();
                            let params = self.prog.functions[idx].params.clone();
                            // Arity check.
                            if args.len() != params.len() {
                                let name = &self.prog.functions[idx].name;
                                return Err(FluxError::runtime(format!(
                                    "function `{name}` expected {} argument(s), got {}",
                                    params.len(),
                                    args.len()
                                )));
                            }
                            // Push a call frame so we know where to return.
                            call_stack.push(CallFrame {
                                instrs: cur_instrs,
                                return_ip: ip,
                                stack_top: self.stack.len(),
                                scope_depth: self.scope_depth,
                                loop_stack_top: self.loop_stack.len(),
                            });
                            // The function body starts with PushScope + Store params,
                            // so we just set up args and switch to the function's instrs.
                            // Pre-define params so Store finds them after PushScope.
                            // Actually the function body emits PushScope then Store for each param.
                            // We just need to push the args onto the stack in order so Store pops them.
                            // Store pops from stack top, so push in reverse order.
                            for arg in args.iter().rev() {
                                self.stack.push(arg.clone());
                            }
                            cur_instrs = func_instrs;
                            ip = 0;
                        }
                        Value::Object(obj) => {
                            if matches!(obj.get("__type"), Some(Value::Text(kind)) if kind == "struct")
                            {
                                let struct_name = obj
                                    .get("__name")
                                    .and_then(|v| {
                                        if let Value::Text(name) = v {
                                            Some(name.clone())
                                        } else {
                                            None
                                        }
                                    })
                                    .unwrap_or_default();
                                let fields = obj
                                    .get("__fields")
                                    .and_then(|v| {
                                        if let Value::List(items) = v {
                                            Some(items.clone())
                                        } else {
                                            None
                                        }
                                    })
                                    .unwrap_or_default();
                                if fields.len() != args.len() {
                                    return Err(FluxError::runtime(format!(
                                        "struct `{struct_name}` expected {} arguments, got {}",
                                        fields.len(),
                                        args.len()
                                    )));
                                }
                                let mut instance = BTreeMap::new();
                                instance.insert(
                                    "__type".to_string(),
                                    Value::Text("struct_instance".to_string()),
                                );
                                instance.insert(
                                    "__struct".to_string(),
                                    Value::Text(struct_name.clone()),
                                );
                                for (field, value) in fields.into_iter().zip(args) {
                                    if let Value::Text(field_name) = field {
                                        instance.insert(field_name, value);
                                    }
                                }
                                self.stack.push(Value::Object(instance));
                            } else {
                                return Err(FluxError::runtime("cannot call an object value"));
                            }
                        }
                        Value::Function(_) => {
                            return Err(FluxError::runtime(
                                "cannot call legacy function in FastVM",
                            ));
                        }
                        _ => {
                            return Err(FluxError::runtime(format!(
                                "cannot call a {}",
                                callee.type_name()
                            )))
                        }
                    }
                }
                // --- Return: restore previous instruction slice ---
                Instr::Ret => {
                    if let Some(frame) = call_stack.pop() {
                        while self.scope_depth > frame.scope_depth {
                            self.env.pop_scope();
                            self.scope_depth -= 1;
                        }
                        self.loop_stack.truncate(frame.loop_stack_top);
                        self.stack.truncate(frame.stack_top);
                        self.stack.push(Value::Nothing);
                        cur_instrs = frame.instrs;
                        ip = frame.return_ip;
                    } else {
                        return Ok(());
                    }
                }
                Instr::RetVal => {
                    let v = self
                        .stack
                        .pop()
                        .ok_or_else(|| FluxError::runtime("stack underflow on RetVal"))?;
                    if let Some(frame) = call_stack.pop() {
                        while self.scope_depth > frame.scope_depth {
                            self.env.pop_scope();
                            self.scope_depth -= 1;
                        }
                        self.loop_stack.truncate(frame.loop_stack_top);
                        self.stack.truncate(frame.stack_top);
                        self.stack.push(v);
                        cur_instrs = frame.instrs;
                        ip = frame.return_ip;
                    } else {
                        return Ok(());
                    }
                }
                Instr::Halt => return Ok(()),
                // --- All other instructions go through exec_instr ---
                other => {
                    match self.exec_instr(other, &cur_instrs, &mut ip) {
                        Ok(Action::Continue) => {}
                        Ok(Action::Halt) => return Ok(()),
                        Ok(Action::BreakLoop) => {
                            if let Some(lf) = self.loop_stack.last() {
                                ip = lf.break_ip;
                            } else {
                                return Err(FluxError::runtime("break used outside loop"));
                            }
                        }
                        Ok(Action::NextLoop) => {
                            if let Some(lf) = self.loop_stack.last() {
                                ip = lf.continue_ip;
                            } else {
                                return Err(FluxError::runtime("next used outside loop"));
                            }
                        }
                        Ok(Action::Return) => {
                            if let Some(frame) = call_stack.pop() {
                                while self.scope_depth > frame.scope_depth {
                                    self.env.pop_scope();
                                    self.scope_depth -= 1;
                                }
                                self.loop_stack.truncate(frame.loop_stack_top);
                                self.stack.truncate(frame.stack_top);
                                self.stack.push(Value::Nothing);
                                cur_instrs = frame.instrs;
                                ip = frame.return_ip;
                            } else {
                                return Ok(());
                            }
                        }
                        Ok(Action::ReturnVal(v)) => {
                            if let Some(frame) = call_stack.pop() {
                                while self.scope_depth > frame.scope_depth {
                                    self.env.pop_scope();
                                    self.scope_depth -= 1;
                                }
                                self.loop_stack.truncate(frame.loop_stack_top);
                                self.stack.truncate(frame.stack_top);
                                self.stack.push(v);
                                cur_instrs = frame.instrs;
                                ip = frame.return_ip;
                            } else {
                                return Ok(());
                            }
                        }
                        Ok(Action::Throw(v)) => {
                            if let Some(h) = self.try_handlers.last() {
                                let catch_ip = h.catch_ip;
                                let st = h.stack_top;
                                let sd = h.scope_depth;
                                while self.scope_depth > sd {
                                    self.env.pop_scope();
                                    self.scope_depth -= 1;
                                }
                                self.stack.truncate(st);
                                self.stack.push(v);
                                ip = catch_ip;
                                self.try_handlers.pop();
                                // If the catch_ip is in a parent call frame, we need to unwind.
                                // For now, catch_ip refers to the current instruction slice.
                            } else {
                                return Err(FluxError::runtime(format!("{v}")).with_line(
                                    self.try_handlers.last().map(|h| h.line).unwrap_or(0),
                                ));
                            }
                        }
                        Err(e) => {
                            if let Some(h) = self.try_handlers.last() {
                                let catch_ip = h.catch_ip;
                                let st = h.stack_top;
                                let sd = h.scope_depth;
                                while self.scope_depth > sd {
                                    self.env.pop_scope();
                                    self.scope_depth -= 1;
                                }
                                self.stack.truncate(st);
                                self.stack.push(Value::Text(e.message.clone()));
                                ip = catch_ip;
                                self.try_handlers.pop();
                            } else {
                                return Err(e.with_line(0));
                            }
                        }
                    }
                }
            }
        }
    }

    #[allow(dead_code)]
    fn exec_instrs(&mut self, instrs: &[Instr], _start: usize) -> Result<(), FluxError> {
        self.exec_program(instrs)
    }

    #[allow(clippy::too_many_lines)]
    fn exec_instr(
        &mut self,
        instr: &Instr,
        _all: &[Instr],
        ip: &mut usize,
    ) -> Result<Action, FluxError> {
        macro_rules! pop {
            () => {
                match self.stack.pop() {
                    Some(v) => v,
                    None => return Err(FluxError::runtime("stack underflow")),
                }
            };
        }
        macro_rules! runtime_err {
            ($msg:expr) => {
                return Err(FluxError::runtime($msg))
            };
        }
        match instr {
            Instr::Const(v) => self.stack.push(v.clone()),
            Instr::Load(name, line) => {
                let v = self.env.get(name).ok_or_else(|| {
                    FluxError::runtime_at(format!("undefined variable `{name}`"), *line, 1)
                })?;
                self.stack.push(v);
            }
            Instr::Store(name) => {
                let v = pop!();
                self.env.define(name, v);
            }
            Instr::StoreConst(name) => {
                let v = pop!();
                self.env.define_const(name, v);
            }
            Instr::Assign(name) => {
                let v = pop!();
                self.env.assign(name, v)?;
            }
            Instr::PushScope => {
                self.env.push_scope();
                self.scope_depth += 1;
            }
            Instr::PopScope => {
                if self.scope_depth > 0 {
                    self.env.pop_scope();
                    self.scope_depth -= 1;
                }
            }
            Instr::Dup => {
                if let Some(v) = self.stack.last() {
                    let v = v.clone();
                    self.stack.push(v);
                } else {
                    return Err(FluxError::runtime("stack underflow on Dup"));
                }
            }
            Instr::Pop => {
                pop!();
            }
            Instr::Swap => {
                let len = self.stack.len();
                if len < 2 {
                    runtime_err!("stack underflow on Swap");
                }
                self.stack.swap(len - 1, len - 2);
            }
            Instr::Add => {
                let b = pop!();
                let a = pop!();
                self.stack.push(match (&a, &b) {
                    (Value::Number(a), Value::Number(b)) => Value::Number(a + b),
                    (Value::Text(a), Value::Text(b)) => Value::Text(format!("{a}{b}")),
                    (Value::Text(a), Value::Number(b)) => Value::Text(format!("{a}{b}")),
                    (Value::Number(a), Value::Text(b)) => Value::Text(format!("{a}{b}")),
                    (Value::List(a), Value::List(b)) => {
                        let mut result = a.clone();
                        result.extend_from_slice(b);
                        Value::List(result)
                    }
                    _ => runtime_err!("cannot add these types"),
                });
            }
            Instr::Sub => {
                let b = pop!();
                let a = pop!();
                if let (Value::Number(a), Value::Number(b)) = (&a, &b) {
                    self.stack.push(Value::Number(a - b));
                } else {
                    runtime_err!("cannot subtract");
                }
            }
            Instr::Mul => {
                let b = pop!();
                let a = pop!();
                if let (Value::Number(a), Value::Number(b)) = (&a, &b) {
                    self.stack.push(Value::Number(a * b));
                } else {
                    runtime_err!("cannot multiply");
                }
            }
            Instr::Div => {
                let b = pop!();
                let a = pop!();
                if let (Value::Number(a), Value::Number(b)) = (&a, &b) {
                    if *b == 0.0 {
                        runtime_err!("divide by zero");
                    }
                    self.stack.push(Value::Number(a / b));
                } else {
                    runtime_err!("cannot divide");
                }
            }
            Instr::Mod => {
                let b = pop!();
                let a = pop!();
                if let (Value::Number(a), Value::Number(b)) = (&a, &b) {
                    if *b == 0.0 {
                        runtime_err!("remainder by zero");
                    }
                    self.stack.push(Value::Number(a % b));
                } else {
                    runtime_err!("cannot use remainder");
                }
            }
            Instr::Pow => {
                let b = pop!();
                let a = pop!();
                if let (Value::Number(a), Value::Number(b)) = (&a, &b) {
                    self.stack.push(Value::Number(a.powf(*b)));
                } else {
                    runtime_err!("cannot raise to power");
                }
            }
            Instr::Neg => {
                let a = pop!();
                if let Value::Number(n) = a {
                    self.stack.push(Value::Number(-n));
                } else {
                    runtime_err!("cannot negate a non-number");
                }
            }
            Instr::Not => {
                let a = pop!();
                self.stack.push(Value::Bool(!a.is_truthy()));
            }
            Instr::Gt => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(val_cmp_gt(&a, &b)?));
            }
            Instr::Ge => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(val_cmp_ge(&a, &b)?));
            }
            Instr::Lt => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(val_cmp_lt(&a, &b)?));
            }
            Instr::Le => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(val_cmp_le(&a, &b)?));
            }
            Instr::Eq => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(a == b));
            }
            Instr::Ne => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(a != b));
            }
            Instr::And => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(a.is_truthy() && b.is_truthy()));
            }
            Instr::Or => {
                let b = pop!();
                let a = pop!();
                self.stack.push(Value::Bool(a.is_truthy() || b.is_truthy()));
            }
            Instr::BitAnd => {
                let b = pop!();
                let a = pop!();
                self.stack.push(bitop(&a, &b, |x, y| x & y)?);
            }
            Instr::BitOr => {
                let b = pop!();
                let a = pop!();
                self.stack.push(bitop(&a, &b, |x, y| x | y)?);
            }
            Instr::BitXor => {
                let b = pop!();
                let a = pop!();
                self.stack.push(bitop(&a, &b, |x, y| x ^ y)?);
            }
            Instr::Shl => {
                let b = pop!();
                let a = pop!();
                self.stack.push(bitop(&a, &b, |x, y| x << y)?);
            }
            Instr::Shr => {
                let b = pop!();
                let a = pop!();
                self.stack.push(bitop(&a, &b, |x, y| x >> y)?);
            }
            Instr::BitNot => {
                let a = pop!();
                if let Value::Number(n) = a {
                    self.stack.push(Value::Number(!(n as i64) as f64));
                } else {
                    runtime_err!("bitwise-not requires a number");
                }
            }
            Instr::Index => {
                let idx = pop!();
                let target = pop!();
                match &target {
                    Value::List(list) => {
                        if let Value::Number(i) = &idx {
                            if *i < 0.0 {
                                runtime_err!("list index must be non-negative");
                            }
                            if i.fract() != 0.0 {
                                runtime_err!("list index must be integer");
                            }
                            let i = *i as usize;
                            self.stack.push(if i < list.len() {
                                list[i].clone()
                            } else {
                                Value::Nothing
                            });
                        } else {
                            runtime_err!("list index must be a non-negative integer");
                        }
                    }
                    Value::Text(s) => {
                        if let Value::Number(i) = &idx {
                            if *i < 0.0 {
                                runtime_err!("text index must be non-negative");
                            }
                            if i.fract() != 0.0 {
                                runtime_err!("text index must be integer");
                            }
                            let i = *i as usize;
                            let ch = s
                                .chars()
                                .nth(i)
                                .map(|c| Value::Text(c.to_string()))
                                .unwrap_or(Value::Nothing);
                            self.stack.push(ch);
                        } else {
                            runtime_err!("text index must be a non-negative integer");
                        }
                    }
                    Value::Object(map) => {
                        if let Value::Text(k) = &idx {
                            self.stack
                                .push(map.get(k).cloned().unwrap_or(Value::Nothing));
                        } else {
                            runtime_err!("object key must be text");
                        }
                    }
                    _ => runtime_err!("cannot index this value"),
                }
            }
            Instr::IndexSet => {
                let val = pop!();
                let idx = pop!();
                let target = pop!();
                if let Value::List(mut list) = target {
                    if let Value::Number(i) = &idx {
                        if *i < 0.0 {
                            runtime_err!("list index must be non-negative");
                        }
                        if i.fract() != 0.0 {
                            runtime_err!("list index must be integer");
                        }
                        let i = *i as usize;
                        if i >= list.len() {
                            runtime_err!("list index out of bounds");
                        }
                        list[i] = val;
                        self.stack.push(Value::List(list));
                    } else {
                        runtime_err!("list index must be a non-negative integer");
                    }
                } else {
                    runtime_err!("cannot index-assign to this value");
                }
            }
            Instr::Property(name) => {
                let target = pop!();
                let v = match &target {
                    Value::Object(obj) => obj.get(name).cloned().unwrap_or(Value::Nothing),
                    Value::Module(m) => m.get(name).cloned().unwrap_or(Value::Nothing),
                    _ => Value::Nothing,
                };
                self.stack.push(v);
            }
            Instr::MakeList(n) => {
                let mut items = Vec::with_capacity(*n);
                for _ in 0..*n {
                    items.push(pop!());
                }
                items.reverse();
                self.stack.push(Value::List(items));
            }
            Instr::MakeObject(n) => {
                let mut map = BTreeMap::new();
                let mut pairs: Vec<(String, Value)> = Vec::with_capacity(*n);
                for _ in 0..*n {
                    let val = pop!();
                    let key = pop!();
                    if let Value::Text(k) = key {
                        pairs.push((k, val));
                    }
                }
                pairs.reverse();
                for (k, v) in pairs {
                    map.insert(k, v);
                }
                self.stack.push(Value::Object(map));
            }
            Instr::SizeOf => {
                let v = pop!();
                let n = match &v {
                    Value::Text(s) => s.chars().count() as f64,
                    Value::List(l) => l.len() as f64,
                    Value::Object(m) => m.len() as f64,
                    _ => 1.0,
                };
                self.stack.push(Value::Number(n));
            }
            Instr::TypeOf => {
                let v = pop!();
                self.stack.push(Value::Text(v.type_name().to_string()));
            }
            Instr::Expand => {
                let v = pop!();
                if let Value::List(items) = v {
                    for item in items {
                        self.stack.push(item);
                    }
                } else {
                    self.stack.push(v);
                }
            }
            Instr::Interpolate(n) => {
                let mut parts = Vec::with_capacity(*n);
                for _ in 0..*n {
                    parts.push(pop!());
                }
                let result: String = parts.into_iter().rev().map(|v| v.to_string()).collect();
                self.stack.push(Value::Text(result));
            }
            Instr::Jump(target) => {
                *ip = *target;
            }
            Instr::JumpIfFalse(target) => {
                let v = pop!();
                if !v.is_truthy() {
                    *ip = *target;
                }
            }
            Instr::JumpIfTrue(target) => {
                let v = pop!();
                if v.is_truthy() {
                    *ip = *target;
                }
            }
            Instr::Halt => return Ok(Action::Halt),
            Instr::Break => return Ok(Action::BreakLoop),
            Instr::Next => return Ok(Action::NextLoop),
            Instr::Ret => return Ok(Action::Return),
            Instr::RetVal => {
                let v = pop!();
                return Ok(Action::ReturnVal(v));
            }
            Instr::Throw => {
                let v = pop!();
                return Ok(Action::Throw(v));
            }
            Instr::Rethrow => {
                let v = pop!();
                return Ok(Action::Throw(v));
            }
            Instr::Assert => {
                let msg = pop!();
                let cond = pop!();
                if !cond.is_truthy() {
                    let m = if let Value::Text(s) = &msg {
                        s.clone()
                    } else {
                        String::new()
                    };
                    let err = if m.is_empty() {
                        "assertion failed".to_string()
                    } else {
                        format!("assertion failed: {m}")
                    };
                    return Err(FluxError::runtime(err));
                }
            }
            Instr::EnterLoop(break_ip, continue_ip) => {
                self.loop_stack.push(LoopFrame {
                    break_ip: *break_ip,
                    continue_ip: *continue_ip,
                });
            }
            Instr::ExitLoop => {
                self.loop_stack.pop();
            }
            Instr::EnterTry(catch_ip, finally_ip, line) => {
                self.try_handlers.push(TryHandler {
                    catch_ip: *catch_ip,
                    finally_ip: if *finally_ip == 0 {
                        None
                    } else {
                        Some(*finally_ip)
                    },
                    stack_top: self.stack.len(),
                    scope_depth: self.scope_depth,
                    line: *line,
                });
            }
            Instr::EndTry => {
                self.try_handlers.pop();
            }
            Instr::MakeFunc(idx) => {
                let func = &self.prog.functions[*idx];
                let fv = FunctionValue {
                    name: func.name.clone(),
                    params: func.params.clone(),
                    body: vec![],
                };
                self.stack.push(Value::Function(std::rc::Rc::new(fv)));
                // Store the compiled instructions index alongside the value.
                // We keep a parallel `compiled_funcs` approach: func idx is stored
                // in a separate slot so Call can look it up.
                // For now we embed the idx in a special tag via the builtin path.
                // Actually we use a different approach: we store the idx as a note.
                // We'll handle this in Instr::Call below.
                // Pop the placeholder and push a tagged value instead.
                self.stack.pop();
                self.stack.push(Value::CompiledFn(*idx));
            }
            Instr::Call(_argc) => {
                // Call is handled in exec_program's main loop.
                // This arm is unreachable during normal execution.
                return Err(FluxError::runtime(
                    "Call instruction reached exec_instr — internal error",
                ));
            }
            Instr::Builtin(name, argc) => {
                let mut args = Vec::with_capacity(*argc);
                for _ in 0..*argc {
                    args.push(pop!());
                }
                args.reverse();
                let result = self.call_builtin(name, args)?;
                if !matches!(result, Value::Nothing) || name.as_str() != "exit" {
                    self.stack.push(result);
                }
            }
            // Ignore any legacy instruction variants that don't apply here.
            Instr::Say | Instr::Input | Instr::InputNumber | Instr::Ternary => {}
        }
        Ok(Action::Continue)
    }

    // -----------------------------------------------------------------------
    // Built-in function dispatch
    // -----------------------------------------------------------------------
    #[allow(clippy::too_many_lines)]
    fn call_builtin(&mut self, name: &str, args: Vec<Value>) -> Result<Value, FluxError> {
        use std::io::Write;
        macro_rules! text_arg {
            ($idx:expr) => {
                match args.get($idx) {
                    Some(Value::Text(s)) => s.as_str(),
                    _ => "",
                }
            };
        }
        macro_rules! num_arg {
            ($idx:expr, $name:expr) => {
                match args.get($idx) {
                    Some(Value::Number(n)) => *n,
                    _ => {
                        return Err(FluxError::runtime(format!(
                            "`{}` expects a number argument",
                            $name
                        )))
                    }
                }
            };
        }
        match name {
            // ---- output --------------------------------------------------
            "say" => {
                println!(
                    "{}",
                    args.first().map(|v| v.to_string()).unwrap_or_default()
                );
                Ok(Value::Nothing)
            }
            "write" | "print" => {
                print!(
                    "{}",
                    args.first().map(|v| v.to_string()).unwrap_or_default()
                );
                std::io::stdout().flush().ok();
                Ok(Value::Nothing)
            }
            "warn" => {
                eprintln!(
                    "warning: {}",
                    args.first().map(|v| v.to_string()).unwrap_or_default()
                );
                Ok(Value::Nothing)
            }
            "fail" => {
                eprintln!(
                    "error: {}",
                    args.first().map(|v| v.to_string()).unwrap_or_default()
                );
                Ok(Value::Nothing)
            }
            "debug" => {
                eprintln!(
                    "debug: {}",
                    args.first().map(|v| v.to_string()).unwrap_or_default()
                );
                Ok(Value::Nothing)
            }
            "clear_screen" => {
                print!("\x1B[2J\x1B[1;1H");
                std::io::stdout().flush().ok();
                Ok(Value::Nothing)
            }
            // ---- input ---------------------------------------------------
            "input" => {
                let prompt = args.first().map(|v| v.to_string()).unwrap_or_default();
                print!("{prompt}");
                std::io::stdout().flush().ok();
                let mut line = String::new();
                std::io::stdin().read_line(&mut line).ok();
                Ok(Value::Text(
                    line.trim_end_matches('\n')
                        .trim_end_matches('\r')
                        .to_string(),
                ))
            }
            "input_number" => {
                let prompt = args.first().map(|v| v.to_string()).unwrap_or_default();
                print!("{prompt}");
                std::io::stdout().flush().ok();
                let mut line = String::new();
                std::io::stdin().read_line(&mut line).ok();
                let trimmed = line.trim();
                match trimmed.parse::<f64>() {
                    Ok(n) => Ok(Value::Number(n)),
                    Err(_) => Err(FluxError::runtime(format!("invalid number: `{trimmed}`"))),
                }
            }
            // ---- type conversions ----------------------------------------
            "text" => Ok(Value::Text(
                args.first().map(|v| v.to_string()).unwrap_or_default(),
            )),
            "number" => {
                let r = match args.first() {
                    Some(Value::Number(n)) => Some(Value::Number(*n)),
                    Some(Value::Text(s)) => s.trim().parse::<f64>().ok().map(Value::Number),
                    Some(Value::Bool(true)) => Some(Value::Number(1.0)),
                    Some(Value::Bool(false)) => Some(Value::Number(0.0)),
                    Some(Value::Nothing) => Some(Value::Number(0.0)),
                    _ => None,
                };
                Ok(r.unwrap_or(Value::Nothing))
            }
            "bool" => Ok(Value::Bool(
                args.first().map(|v| v.is_truthy()).unwrap_or(false),
            )),
            "type_of" => Ok(Value::Text(
                args.first()
                    .map(|v| v.type_name().to_string())
                    .unwrap_or("nothing".into()),
            )),
            // ---- math ----------------------------------------------------
            "abs" => {
                let n = num_arg!(0, "abs");
                Ok(Value::Number(n.abs()))
            }
            "sqrt" => {
                let n = num_arg!(0, "sqrt");
                Ok(Value::Number(n.sqrt()))
            }
            "floor" => {
                let n = num_arg!(0, "floor");
                Ok(Value::Number(n.floor()))
            }
            "ceil" => {
                let n = num_arg!(0, "ceil");
                Ok(Value::Number(n.ceil()))
            }
            "round" => {
                let n = num_arg!(0, "round");
                Ok(Value::Number(n.round()))
            }
            "sin" => {
                let n = num_arg!(0, "sin");
                Ok(Value::Number(n.sin()))
            }
            "cos" => {
                let n = num_arg!(0, "cos");
                Ok(Value::Number(n.cos()))
            }
            "tan" => {
                let n = num_arg!(0, "tan");
                Ok(Value::Number(n.tan()))
            }
            "log" | "ln" => {
                let n = num_arg!(0, name);
                Ok(Value::Number(n.ln()))
            }
            "log10" => {
                let n = num_arg!(0, "log10");
                Ok(Value::Number(n.log10()))
            }
            "exp" => {
                let n = num_arg!(0, "exp");
                Ok(Value::Number(n.exp()))
            }
            "min" => {
                let a = num_arg!(0, "min");
                let b = num_arg!(1, "min");
                Ok(Value::Number(a.min(b)))
            }
            "max" => {
                let a = num_arg!(0, "max");
                let b = num_arg!(1, "max");
                Ok(Value::Number(a.max(b)))
            }
            "pow" => {
                let a = num_arg!(0, "pow");
                let b = num_arg!(1, "pow");
                Ok(Value::Number(a.powf(b)))
            }
            "gcd" => {
                let a = num_arg!(0, "gcd") as i64;
                let b = num_arg!(1, "gcd") as i64;
                Ok(Value::Number(gcd_i64(a, b) as f64))
            }
            "lcm" => {
                let a = num_arg!(0, "lcm") as i64;
                let b = num_arg!(1, "lcm") as i64;
                let gcd = gcd_i64(a, b);
                let lcm = if a == 0 || b == 0 {
                    0
                } else {
                    (a / gcd).abs() * b.abs()
                };
                Ok(Value::Number(lcm as f64))
            }
            "is_prime" => {
                let n = num_arg!(0, "is_prime") as i64;
                Ok(Value::Bool(is_prime_i64(n)))
            }
            "factorial" => {
                let n = num_arg!(0, "factorial");
                if n < 0.0 || n.fract() != 0.0 {
                    return Err(FluxError::runtime(
                        "factorial requires a non-negative integer",
                    ));
                }
                let mut result = 1.0;
                for i in 2..=(n as u64) {
                    result *= i as f64;
                }
                Ok(Value::Number(result))
            }
            "fibonacci" => {
                let n = num_arg!(0, "fibonacci");
                if n < 0.0 || n.fract() != 0.0 {
                    return Err(FluxError::runtime(
                        "fibonacci requires a non-negative integer",
                    ));
                }
                let mut a = 0.0;
                let mut b = 1.0;
                for _ in 0..(n as u64) {
                    let next = a + b;
                    a = b;
                    b = next;
                }
                Ok(Value::Number(a))
            }
            "random" => Ok(Value::Number(self.next_random_f64())),
            "random_int" => {
                let lo = num_arg!(0, "random_int") as i64;
                let hi = num_arg!(1, "random_int") as i64;
                if hi <= lo {
                    return Ok(Value::Number(lo as f64));
                }
                let range = (hi - lo) as u64;
                let value = self.next_random_u64() % range;
                Ok(Value::Number((lo + value as i64) as f64))
            }
            // ---- string --------------------------------------------------
            "len" => {
                let n = match args.first() {
                    Some(Value::Text(s)) => s.chars().count() as f64,
                    Some(Value::List(l)) => l.len() as f64,
                    Some(Value::Object(m)) => m.len() as f64,
                    _ => 0.0,
                };
                Ok(Value::Number(n))
            }
            "contains" => {
                let r = match (args.first(), args.get(1)) {
                    (Some(Value::Text(s)), Some(Value::Text(p))) => s.contains(p.as_str()),
                    (Some(Value::List(l)), Some(v)) => l.contains(v),
                    _ => false,
                };
                Ok(Value::Bool(r))
            }
            "find" => {
                let haystack = text_arg!(0);
                let needle = text_arg!(1);
                Ok(Value::Number(
                    haystack.find(needle).map(|i| i as f64).unwrap_or(-1.0),
                ))
            }
            "replace" => {
                let s = text_arg!(0).to_string();
                let from = text_arg!(1).to_string();
                let to = match args.get(2) {
                    Some(Value::Text(t)) => t.clone(),
                    _ => String::new(),
                };
                Ok(Value::Text(s.replace(&from, &to)))
            }
            "split" => {
                let s = text_arg!(0).to_string();
                let sep = text_arg!(1);
                let parts: Vec<Value> = if sep.is_empty() {
                    s.chars().map(|c| Value::Text(c.to_string())).collect()
                } else {
                    s.split(sep).map(|p| Value::Text(p.to_string())).collect()
                };
                Ok(Value::List(parts))
            }
            "join" => {
                let sep = text_arg!(1);
                if let Some(Value::List(list)) = args.first() {
                    Ok(Value::Text(
                        list.iter()
                            .map(|v| v.to_string())
                            .collect::<Vec<_>>()
                            .join(sep),
                    ))
                } else {
                    Ok(Value::Text(String::new()))
                }
            }
            "trim" => Ok(Value::Text(text_arg!(0).trim().to_string())),
            "upper" => Ok(Value::Text(text_arg!(0).to_uppercase())),
            "lower" => Ok(Value::Text(text_arg!(0).to_lowercase())),
            "starts_with" => {
                if let (Some(Value::Text(s)), Some(Value::Text(p))) = (args.first(), args.get(1)) {
                    Ok(Value::Bool(s.starts_with(p.as_str())))
                } else {
                    Ok(Value::Bool(false))
                }
            }
            "ends_with" => {
                if let (Some(Value::Text(s)), Some(Value::Text(p))) = (args.first(), args.get(1)) {
                    Ok(Value::Bool(s.ends_with(p.as_str())))
                } else {
                    Ok(Value::Bool(false))
                }
            }
            "atoi" => {
                let s = text_arg!(0);
                Ok(s.parse::<i64>()
                    .map(|i| Value::Number(i as f64))
                    .unwrap_or(Value::Nothing))
            }
            "itoa" => Ok(Value::Text(
                args.first().map(|v| v.to_string()).unwrap_or_default(),
            )),
            "pad_left" | "pad_right" => {
                let s = text_arg!(0).to_string();
                let width = num_arg!(1, name);
                if width < 0.0 || width.fract() != 0.0 {
                    return Err(FluxError::runtime(format!(
                        "{name} requires a non-negative integer width"
                    )));
                }
                let ch = text_arg!(2).chars().next().unwrap_or(' ');
                let len = s.chars().count();
                let width = width as usize;
                if len >= width {
                    return Ok(Value::Text(s));
                }
                let padding: String = std::iter::repeat_n(ch, width - len).collect();
                if name == "pad_left" {
                    Ok(Value::Text(format!("{padding}{s}")))
                } else {
                    Ok(Value::Text(format!("{s}{padding}")))
                }
            }
            "count" => {
                let s = text_arg!(0);
                let sub = text_arg!(1);
                if sub.is_empty() {
                    Ok(Value::Number(0.0))
                } else {
                    Ok(Value::Number(s.matches(sub).count() as f64))
                }
            }
            "to_chars" => Ok(Value::List(
                text_arg!(0)
                    .chars()
                    .map(|c| Value::Text(c.to_string()))
                    .collect(),
            )),
            // ---- list ----------------------------------------------------
            "sort" => {
                if let Some(Value::List(mut l)) = args.into_iter().next() {
                    // Numeric sort when all elements are numbers; else lexicographic.
                    let all_numbers = l.iter().all(|v| matches!(v, Value::Number(_)));
                    if all_numbers {
                        l.sort_by(|a, b| {
                            let na = if let Value::Number(n) = a { *n } else { 0.0 };
                            let nb = if let Value::Number(n) = b { *n } else { 0.0 };
                            na.partial_cmp(&nb).unwrap_or(std::cmp::Ordering::Equal)
                        });
                    } else {
                        l.sort_by_key(|a| a.to_string());
                    }
                    Ok(Value::List(l))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "sort_by" => {
                // sort_by(list, key_fn) – key_fn is a CompiledFn or Function
                // For now: lexicographic sort as fallback (key_fn support in Phase 4)
                if let Some(Value::List(mut l)) = args.into_iter().next() {
                    l.sort_by_key(|a| a.to_string());
                    Ok(Value::List(l))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "sort_numbers" => {
                if let Some(Value::List(list)) = args.first() {
                    let mut nums = Vec::with_capacity(list.len());
                    for value in list {
                        if let Value::Number(n) = value {
                            nums.push(*n);
                        } else {
                            return Err(FluxError::runtime(
                                "sort_numbers requires a list of numbers",
                            ));
                        }
                    }
                    nums.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
                    Ok(Value::List(nums.into_iter().map(Value::Number).collect()))
                } else {
                    Err(FluxError::runtime("sort_numbers requires a list"))
                }
            }
            "sort_by_key" => {
                let list = match args.first() {
                    Some(Value::List(list)) => list.clone(),
                    _ => return Err(FluxError::runtime("sort_by_key requires a list")),
                };
                let key_fn = args
                    .get(1)
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("sort_by_key requires a function"))?;
                let mut keyed = Vec::with_capacity(list.len());
                for item in list {
                    let key = self.invoke_value(key_fn.clone(), vec![item.clone()])?;
                    keyed.push((key.to_string(), item));
                }
                keyed.sort_by(|a, b| a.0.cmp(&b.0));
                Ok(Value::List(
                    keyed.into_iter().map(|(_, item)| item).collect(),
                ))
            }
            "reverse" => {
                if let Some(Value::List(mut l)) = args.into_iter().next() {
                    l.reverse();
                    Ok(Value::List(l))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "range" => {
                let (start, end, step) = match args.len() {
                    1 => (0i64, num_arg!(0, "range") as i64, 1i64),
                    2 => (num_arg!(0, "range") as i64, num_arg!(1, "range") as i64, 1),
                    _ => (
                        num_arg!(0, "range") as i64,
                        num_arg!(1, "range") as i64,
                        num_arg!(2, "range") as i64,
                    ),
                };
                let step = if step == 0 { 1 } else { step };
                let mut items = vec![];
                let mut i = start;
                while if step > 0 { i < end } else { i > end } {
                    items.push(Value::Number(i as f64));
                    i += step;
                }
                Ok(Value::List(items))
            }
            "map" => {
                let list = match args.first() {
                    Some(Value::List(list)) => list.clone(),
                    _ => return Err(FluxError::runtime("map requires a list")),
                };
                let func = args
                    .get(1)
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("map requires a function"))?;
                let mut result = Vec::with_capacity(list.len());
                for item in list {
                    result.push(self.invoke_value(func.clone(), vec![item])?);
                }
                Ok(Value::List(result))
            }
            "filter" => {
                let list = match args.first() {
                    Some(Value::List(list)) => list.clone(),
                    _ => return Err(FluxError::runtime("filter requires a list")),
                };
                let func = args
                    .get(1)
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("filter requires a function"))?;
                let mut result = Vec::new();
                for item in list {
                    if self
                        .invoke_value(func.clone(), vec![item.clone()])?
                        .is_truthy()
                    {
                        result.push(item);
                    }
                }
                Ok(Value::List(result))
            }
            "reduce" => {
                let list = match args.first() {
                    Some(Value::List(list)) => list.clone(),
                    _ => return Err(FluxError::runtime("reduce requires a list")),
                };
                let func = args
                    .get(1)
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("reduce requires a function"))?;
                let mut acc = args.get(2).cloned().unwrap_or(Value::Nothing);
                for item in list {
                    acc = self.invoke_value(func.clone(), vec![acc, item])?;
                }
                Ok(acc)
            }
            "stack_new" => Ok(collection_object("stack", Vec::new())),
            "queue_new" => Ok(collection_object("queue", Vec::new())),
            // ---- object --------------------------------------------------
            "keys" => {
                if let Some(Value::Object(m)) = args.first() {
                    Ok(Value::List(
                        m.keys().map(|k| Value::Text(k.clone())).collect(),
                    ))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "values" => {
                if let Some(Value::Object(m)) = args.first() {
                    Ok(Value::List(m.values().cloned().collect()))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "has" => {
                let key = text_arg!(1);
                if let Some(Value::Object(m)) = args.first() {
                    Ok(Value::Bool(m.contains_key(key)))
                } else {
                    Ok(Value::Bool(false))
                }
            }
            "clear" => Ok(match args.first() {
                Some(Value::List(_)) => Value::List(vec![]),
                Some(Value::Object(_)) => Value::Object(BTreeMap::new()),
                _ => Value::Nothing,
            }),
            // ---- type checks ---------------------------------------------
            "is_number" => Ok(Value::Bool(matches!(args.first(), Some(Value::Number(_))))),
            "is_text" => Ok(Value::Bool(matches!(args.first(), Some(Value::Text(_))))),
            "is_bool" => Ok(Value::Bool(matches!(args.first(), Some(Value::Bool(_))))),
            "is_list" => Ok(Value::Bool(matches!(args.first(), Some(Value::List(_))))),
            "is_object" => Ok(Value::Bool(matches!(args.first(), Some(Value::Object(_))))),
            "is_function" => Ok(Value::Bool(matches!(
                args.first(),
                Some(Value::CompiledFn(_)) | Some(Value::Function(_))
            ))),
            "is_nothing" => Ok(Value::Bool(matches!(
                args.first(),
                Some(Value::Nothing) | None
            ))),
            // ---- time / sleep --------------------------------------------
            "time" => {
                let d = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default();
                Ok(Value::Number(d.as_secs_f64()))
            }
            "sleep" => {
                let ms = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0.0) as u64;
                std::thread::sleep(std::time::Duration::from_millis(ms));
                Ok(Value::Nothing)
            }
            // ---- system --------------------------------------------------
            "exit" => {
                let code = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n as i32)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0);
                std::process::exit(code);
            }
            "env" => {
                let k = text_arg!(0);
                Ok(std::env::var(k).map(Value::Text).unwrap_or(Value::Nothing))
            }
            "cwd" => std::env::current_dir()
                .map(|p| Value::Text(p.to_string_lossy().to_string()))
                .map_err(|e| FluxError::runtime(format!("cwd failed: {e}"))),
            "args" => Ok(Value::List(
                std::env::args().skip(1).map(Value::Text).collect(),
            )),
            "cd" => {
                let p = text_arg!(0);
                std::env::set_current_dir(p)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("cd failed: {e}")))
            }
            // ---- file I/O ------------------------------------------------
            "read_file" => {
                let p = text_arg!(0);
                std::fs::read_to_string(p)
                    .map(Value::Text)
                    .or(Ok(Value::Nothing))
            }
            "write_file" => {
                let p = text_arg!(0);
                let c = text_arg!(1);
                std::fs::write(p, c)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("write_file failed: {e}")))
            }
            "append_file" => {
                let p = text_arg!(0);
                let c = text_arg!(1);
                use std::io::Write as IoWrite;
                std::fs::OpenOptions::new()
                    .append(true)
                    .create(true)
                    .open(p)
                    .and_then(|mut f| f.write_all(c.as_bytes()))
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("append_file failed: {e}")))
            }
            "file_exists" => Ok(Value::Bool(std::path::Path::new(text_arg!(0)).exists())),
            "file_delete" => {
                let p = text_arg!(0);
                std::fs::remove_file(p)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("file_delete failed: {e}")))
            }
            "file_copy" => {
                let src = text_arg!(0);
                let dst = text_arg!(1);
                std::fs::copy(src, dst)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("file_copy failed: {e}")))
            }
            "file_size" => {
                let p = text_arg!(0);
                std::fs::metadata(p)
                    .map(|m| Value::Number(m.len() as f64))
                    .or(Ok(Value::Number(0.0)))
            }
            "list_dir" => {
                let p = text_arg!(0);
                let entries = std::fs::read_dir(p)
                    .map(|d| {
                        d.filter_map(|e| e.ok())
                            .map(|e| Value::Text(e.file_name().to_string_lossy().to_string()))
                            .collect()
                    })
                    .unwrap_or_default();
                Ok(Value::List(entries))
            }
            "create_dir" => {
                let p = text_arg!(0);
                std::fs::create_dir_all(p)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("create_dir failed: {e}")))
            }
            // ---- JSON ----------------------------------------------------
            "parse_json" => {
                let s = text_arg!(0);
                json_parse(s)
            }
            "stringify_json" => {
                let v = args.into_iter().next().unwrap_or(Value::Nothing);
                json_stringify(&v)
            }
            "parse_csv" => Ok(parse_csv_value(text_arg!(0))),
            "stringify_csv" => {
                let rows = args.first().cloned().unwrap_or(Value::Nothing);
                stringify_csv_value(&rows).map(Value::Text)
            }
            // ---- date ----------------------------------------------------
            "date_now" => {
                let d = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default();
                let mut m = BTreeMap::new();
                m.insert("unix".to_string(), Value::Number(d.as_secs_f64()));
                Ok(Value::Object(m))
            }
            "format_date" => Ok(Value::Text(
                args.first().map(|v| v.to_string()).unwrap_or_default(),
            )),
            "format" => {
                let mut output = text_arg!(0).to_string();
                for (index, value) in args.iter().enumerate().skip(1) {
                    output = output.replace(&format!("{{{}}}", index - 1), &value.to_string());
                }
                Ok(Value::Text(output))
            }
            "assert_eq" => {
                let left = args.first().cloned().unwrap_or(Value::Nothing);
                let right = args.get(1).cloned().unwrap_or(Value::Nothing);
                if left == right {
                    Ok(Value::Nothing)
                } else {
                    let msg = args
                        .get(2)
                        .map(|v| v.to_string())
                        .filter(|s| !s.is_empty())
                        .unwrap_or_else(|| format!("expected {left}, got {right}"));
                    Err(FluxError::runtime(format!("assert_eq failed: {msg}")))
                }
            }
            "assert_error" => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("assert_error requires a function"))?;
                match self.invoke_value(func, Vec::new()) {
                    Ok(_) => {
                        let msg = args
                            .get(1)
                            .map(|v| v.to_string())
                            .filter(|s| !s.is_empty())
                            .unwrap_or_else(|| "expected function to raise an error".to_string());
                        Err(FluxError::runtime(format!("assert_error failed: {msg}")))
                    }
                    Err(_) => Ok(Value::Nothing),
                }
            }
            // ---- modules -------------------------------------------------
            "use_module" => {
                let path = text_arg!(0).to_string();
                let module = load_module_builtin(&path)?;
                // Inject all names from module into current scope.
                for (k, v) in &module {
                    self.env.define(k, v.clone());
                }
                Ok(Value::Module(module))
            }
            "use_from" => {
                // args[0] = path, args[1..] = names to import
                let path = text_arg!(0).to_string();
                let module = load_module_builtin(&path)?;
                for i in 1..args.len() {
                    if let Some(Value::Text(name)) = args.get(i) {
                        let val = module.get(name.as_str()).cloned().unwrap_or(Value::Nothing);
                        self.env.define(name, val);
                    }
                }
                Ok(Value::Nothing)
            }
            "export" => {
                let export_name = text_arg!(0).to_string();
                let mut exports = match self.env.get("__exports") {
                    Some(Value::List(items)) => items,
                    _ => Vec::new(),
                };
                if !export_name.is_empty()
                    && !exports
                        .iter()
                        .any(|v| matches!(v, Value::Text(name) if name == &export_name))
                {
                    exports.push(Value::Text(export_name));
                }
                if let Some(Value::Text(name)) = exports.last() {
                    if self.env.get(name).is_none() && self.is_builtin(name) {
                        self.env
                            .define(name, Value::Text(format!("builtin:{name}")));
                    }
                }
                self.env.define("__exports", Value::List(exports));
                Ok(Value::Nothing)
            }
            // ---- struct / enum helpers -----------------------------------
            "register_struct" => {
                // Returns a constructor function (CompiledFn placeholder).
                // For now returns the descriptor object unchanged.
                Ok(args.into_iter().next().unwrap_or(Value::Nothing))
            }
            "make_enum_variant" => {
                // make_enum_variant(enum_name, variant_name) → object
                let enum_name = text_arg!(0).to_string();
                let variant_name = text_arg!(1).to_string();
                let mut m = BTreeMap::new();
                m.insert("__enum".to_string(), Value::Text(enum_name));
                m.insert("__variant".to_string(), Value::Text(variant_name));
                Ok(Value::Object(m))
            }
            "attach_method" => {
                // attach_method(struct_obj, fn_value) – ignored for now, methods
                // are stored globally in the environment by name.
                Ok(Value::Nothing)
            }
            _ if name.starts_with('.') => {
                // Dot-method dispatch: args[last] is the receiver (self), args[0..n-1] are method args.
                // Compiled as: push extra_args (rev), push receiver → Builtin(".method", n)
                // So args[n-1] = receiver, args[0..n-2] = method arguments.
                let method = &name[1..]; // strip leading '.'
                let receiver = args.last().cloned().unwrap_or(Value::Nothing);
                let method_args: Vec<Value> = args[..args.len().saturating_sub(1)].to_vec();
                self.call_dot_method(method, receiver, method_args)
            }
            _ => Err(FluxError::runtime(format!("unknown builtin `{name}`"))),
        }
    }
    // -----------------------------------------------------------------------
    // Dot-method dispatch  (receiver.method(args))
    // -----------------------------------------------------------------------
    fn call_dot_method(
        &mut self,
        method: &str,
        receiver: Value,
        args: Vec<Value>,
    ) -> Result<Value, FluxError> {
        match (&receiver, method) {
            (Value::Object(obj), "stack_push") if collection_kind(obj) == Some("stack") => {
                let mut items = collection_items(obj);
                items.push(args.first().cloned().unwrap_or(Value::Nothing));
                Ok(collection_object("stack", items))
            }
            (Value::Object(obj), "stack_pop") if collection_kind(obj) == Some("stack") => {
                Ok(collection_items(obj).pop().unwrap_or(Value::Nothing))
            }
            (Value::Object(obj), "stack_peek") if collection_kind(obj) == Some("stack") => {
                Ok(collection_items(obj)
                    .last()
                    .cloned()
                    .unwrap_or(Value::Nothing))
            }
            (Value::Object(obj), "stack_is_empty") if collection_kind(obj) == Some("stack") => {
                Ok(Value::Bool(collection_items(obj).is_empty()))
            }
            (Value::Object(obj), "enqueue") if collection_kind(obj) == Some("queue") => {
                let mut items = collection_items(obj);
                items.push(args.first().cloned().unwrap_or(Value::Nothing));
                Ok(collection_object("queue", items))
            }
            (Value::Object(obj), "dequeue") if collection_kind(obj) == Some("queue") => {
                let items = collection_items(obj);
                Ok(items.first().cloned().unwrap_or(Value::Nothing))
            }
            (Value::Object(obj), "queue_peek") if collection_kind(obj) == Some("queue") => {
                let items = collection_items(obj);
                Ok(items.first().cloned().unwrap_or(Value::Nothing))
            }
            (Value::Object(obj), "queue_is_empty") if collection_kind(obj) == Some("queue") => {
                Ok(Value::Bool(collection_items(obj).is_empty()))
            }
            // ---- Text methods ------------------------------------------
            (Value::Text(s), "upper") => Ok(Value::Text(s.to_uppercase())),
            (Value::Text(s), "lower") => Ok(Value::Text(s.to_lowercase())),
            (Value::Text(s), "trim") => Ok(Value::Text(s.trim().to_string())),
            (Value::Text(s), "len") => Ok(Value::Number(s.chars().count() as f64)),
            (Value::Text(s), "length") => Ok(Value::Number(s.chars().count() as f64)),
            (Value::Text(s), "reverse") => Ok(Value::Text(s.chars().rev().collect())),
            (Value::Text(s), "contains") => {
                let pat = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(Value::Bool(s.contains(pat)))
            }
            (Value::Text(s), "starts_with") => {
                let pat = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(Value::Bool(s.starts_with(pat)))
            }
            (Value::Text(s), "ends_with") => {
                let pat = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(Value::Bool(s.ends_with(pat)))
            }
            (Value::Text(s), "replace") => {
                let from = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.clone())
                        } else {
                            None
                        }
                    })
                    .unwrap_or_default();
                let to = args
                    .get(1)
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.clone())
                        } else {
                            None
                        }
                    })
                    .unwrap_or_default();
                Ok(Value::Text(s.replace(&from, &to)))
            }
            (Value::Text(s), "split") => {
                let sep = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.clone())
                        } else {
                            None
                        }
                    })
                    .unwrap_or_default();
                Ok(Value::List(
                    s.split(sep.as_str())
                        .map(|p| Value::Text(p.to_string()))
                        .collect(),
                ))
            }
            (Value::Text(s), "find") => {
                let pat = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(Value::Number(s.find(pat).map(|i| i as f64).unwrap_or(-1.0)))
            }
            (Value::Text(s), "chars") => Ok(Value::List(
                s.chars().map(|c| Value::Text(c.to_string())).collect(),
            )),
            (Value::Text(s), "repeat") => {
                let n = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n as usize)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0);
                Ok(Value::Text(s.repeat(n)))
            }
            (Value::Text(s), "to_number") => Ok(s
                .trim()
                .parse::<f64>()
                .map(Value::Number)
                .unwrap_or(Value::Nothing)),
            (Value::Text(s), "is_empty") => Ok(Value::Bool(s.is_empty())),
            // ---- List methods ------------------------------------------
            (Value::List(l), "len") | (Value::List(l), "length") => {
                Ok(Value::Number(l.len() as f64))
            }
            (Value::List(l), "is_empty") => Ok(Value::Bool(l.is_empty())),
            (Value::List(l), "first") => Ok(l.first().cloned().unwrap_or(Value::Nothing)),
            (Value::List(l), "last") => Ok(l.last().cloned().unwrap_or(Value::Nothing)),
            (Value::List(l), "reverse") => {
                let mut r = l.clone();
                r.reverse();
                Ok(Value::List(r))
            }
            (Value::List(l), "sort") => {
                let mut r = l.clone();
                let all_numbers = r.iter().all(|v| matches!(v, Value::Number(_)));
                if all_numbers {
                    r.sort_by(|a, b| {
                        let na = if let Value::Number(n) = a { *n } else { 0.0 };
                        let nb = if let Value::Number(n) = b { *n } else { 0.0 };
                        na.partial_cmp(&nb).unwrap_or(std::cmp::Ordering::Equal)
                    });
                } else {
                    r.sort_by_key(|a| a.to_string());
                }
                Ok(Value::List(r))
            }
            (Value::List(l), "push") => {
                let val = args.first().cloned().unwrap_or(Value::Nothing);
                let mut r = l.clone();
                r.push(val);
                Ok(Value::List(r))
            }
            (Value::List(l), "pop") => {
                let mut r = l.clone();
                r.pop();
                Ok(Value::List(r))
            }
            (Value::List(l), "shift") => {
                if l.is_empty() {
                    return Ok(Value::Nothing);
                }
                Ok(l.first().cloned().unwrap_or(Value::Nothing))
            }
            (Value::List(l), "contains") => {
                let val = args.first().cloned().unwrap_or(Value::Nothing);
                Ok(Value::Bool(l.contains(&val)))
            }
            (Value::List(l), "join") => {
                let sep = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(Value::Text(
                    l.iter()
                        .map(|v| v.to_string())
                        .collect::<Vec<_>>()
                        .join(sep),
                ))
            }
            (Value::List(l), "sum") => {
                let total: f64 = l
                    .iter()
                    .filter_map(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .sum();
                Ok(Value::Number(total))
            }
            (Value::List(l), "avg") | (Value::List(l), "mean") => {
                if l.is_empty() {
                    return Ok(Value::Number(0.0));
                }
                let total: f64 = l
                    .iter()
                    .filter_map(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .sum();
                Ok(Value::Number(total / l.len() as f64))
            }
            (Value::List(l), "min") => {
                let m = l
                    .iter()
                    .filter_map(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .fold(f64::INFINITY, f64::min);
                Ok(if m.is_infinite() {
                    Value::Nothing
                } else {
                    Value::Number(m)
                })
            }
            (Value::List(l), "max") => {
                let m = l
                    .iter()
                    .filter_map(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .fold(f64::NEG_INFINITY, f64::max);
                Ok(if m.is_infinite() {
                    Value::Nothing
                } else {
                    Value::Number(m)
                })
            }
            (Value::List(l), "slice") => {
                let start = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n as usize)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0);
                let end = args
                    .get(1)
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n as usize)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(l.len());
                let end = end.min(l.len());
                let start = start.min(end);
                Ok(Value::List(l[start..end].to_vec()))
            }
            (Value::List(l), "take") => {
                let n = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0.0);
                if n < 0.0 {
                    return Err(FluxError::runtime(
                        "take count must be a non-negative integer",
                    ));
                }
                if n.fract() != 0.0 {
                    return Err(FluxError::runtime(
                        "take count must be a non-negative integer",
                    ));
                }
                Ok(Value::List(l.iter().take(n as usize).cloned().collect()))
            }
            (Value::List(l), "drop") => {
                let n = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0.0);
                if n < 0.0 {
                    return Err(FluxError::runtime(
                        "drop count must be a non-negative integer",
                    ));
                }
                if n.fract() != 0.0 {
                    return Err(FluxError::runtime(
                        "drop count must be a non-negative integer",
                    ));
                }
                Ok(Value::List(l.iter().skip(n as usize).cloned().collect()))
            }
            (Value::List(l), "index_of") => {
                let val = args.first().cloned().unwrap_or(Value::Nothing);
                let idx = l.iter().position(|v| v == &val);
                Ok(idx
                    .map(|i| Value::Number(i as f64))
                    .unwrap_or(Value::Number(-1.0)))
            }
            (Value::List(l), "flatten") => {
                let mut result = Vec::new();
                for v in l {
                    if let Value::List(inner) = v {
                        result.extend(inner.clone());
                    } else {
                        result.push(v.clone());
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(l), "unique") => {
                let mut result = Vec::new();
                for item in l {
                    if !result.contains(item) {
                        result.push(item.clone());
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(l), "zip") => {
                let other = match args.first() {
                    Some(Value::List(items)) => items.clone(),
                    _ => return Err(FluxError::runtime("zip requires a list")),
                };
                let pairs = l
                    .iter()
                    .cloned()
                    .zip(other)
                    .map(|(a, b)| Value::List(vec![a, b]))
                    .collect();
                Ok(Value::List(pairs))
            }
            (Value::List(l), "map") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("map requires a function"))?;
                let mut result = Vec::with_capacity(l.len());
                for item in l.clone() {
                    result.push(self.invoke_value(func.clone(), vec![item])?);
                }
                Ok(Value::List(result))
            }
            (Value::List(l), "filter") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("filter requires a function"))?;
                let mut result = Vec::new();
                for item in l.clone() {
                    if self
                        .invoke_value(func.clone(), vec![item.clone()])?
                        .is_truthy()
                    {
                        result.push(item);
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(l), "reduce") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("reduce requires a function"))?;
                let mut acc = args.get(1).cloned().unwrap_or(Value::Nothing);
                for item in l.clone() {
                    acc = self.invoke_value(func.clone(), vec![acc, item])?;
                }
                Ok(acc)
            }
            (Value::List(l), "flat_map") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("flat_map requires a function"))?;
                let mut result = Vec::new();
                for item in l {
                    match self.invoke_value(func.clone(), vec![item.clone()])? {
                        Value::List(items) => result.extend(items),
                        value => result.push(value),
                    }
                }
                Ok(Value::List(result))
            }
            (Value::List(l), "count") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("count requires a function"))?;
                let mut count = 0usize;
                for item in l {
                    if self
                        .invoke_value(func.clone(), vec![item.clone()])?
                        .is_truthy()
                    {
                        count += 1;
                    }
                }
                Ok(Value::Number(count as f64))
            }
            (Value::List(l), "any") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("any requires a function"))?;
                for item in l {
                    if self
                        .invoke_value(func.clone(), vec![item.clone()])?
                        .is_truthy()
                    {
                        return Ok(Value::Bool(true));
                    }
                }
                Ok(Value::Bool(false))
            }
            (Value::List(l), "all") => {
                let func = args
                    .first()
                    .cloned()
                    .ok_or_else(|| FluxError::runtime("all requires a function"))?;
                for item in l {
                    if !self
                        .invoke_value(func.clone(), vec![item.clone()])?
                        .is_truthy()
                    {
                        return Ok(Value::Bool(false));
                    }
                }
                Ok(Value::Bool(true))
            }
            (Value::List(l), "chunk") => {
                let n = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(n) = v {
                            Some(*n)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(0.0);
                if n <= 0.0 || n.fract() != 0.0 {
                    return Err(FluxError::runtime("chunk size must be a positive integer"));
                }
                Ok(Value::List(
                    l.chunks(n as usize)
                        .map(|chunk| Value::List(chunk.to_vec()))
                        .collect(),
                ))
            }
            (Value::List(l), "to_text") => Ok(Value::Text(format!("{}", Value::List(l.clone())))),
            // ---- Object methods ----------------------------------------
            (Value::Object(m), "keys") => Ok(Value::List(
                m.keys().map(|k| Value::Text(k.clone())).collect(),
            )),
            (Value::Object(m), "values") => Ok(Value::List(m.values().cloned().collect())),
            (Value::Object(m), "len") | (Value::Object(m), "length") => {
                Ok(Value::Number(m.len() as f64))
            }
            (Value::Object(m), "has") => {
                let key = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(Value::Bool(m.contains_key(key)))
            }
            (Value::Object(m), "get") => {
                let key = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                Ok(m.get(key).cloned().unwrap_or(Value::Nothing))
            }
            (Value::Object(m), "set") => {
                let key = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.clone())
                        } else {
                            None
                        }
                    })
                    .unwrap_or_default();
                let val = args.get(1).cloned().unwrap_or(Value::Nothing);
                let mut r = m.clone();
                r.insert(key, val);
                Ok(Value::Object(r))
            }
            (Value::Object(m), "delete") => {
                let key = args
                    .first()
                    .and_then(|v| {
                        if let Value::Text(t) = v {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .unwrap_or("");
                let mut r = m.clone();
                r.remove(key);
                Ok(Value::Object(r))
            }
            (Value::Object(m), "to_pairs") => Ok(Value::List(
                m.iter()
                    .map(|(k, v)| Value::List(vec![Value::Text(k.clone()), v.clone()]))
                    .collect(),
            )),
            (Value::Object(obj), method) if matches!(obj.get("__type"), Some(Value::Text(kind)) if kind == "struct_instance") =>
            {
                let struct_name = obj
                    .get("__struct")
                    .and_then(|v| {
                        if let Value::Text(name) = v {
                            Some(name.clone())
                        } else {
                            None
                        }
                    })
                    .unwrap_or_default();
                if !struct_name.is_empty() {
                    let method_key = format!("{struct_name}.{method}");
                    if let Some(value) = self.env.get(&method_key) {
                        let mut call_args = Vec::with_capacity(args.len() + 1);
                        call_args.push(receiver.clone());
                        call_args.extend(args);
                        return self.invoke_value(value, call_args);
                    }
                }
                Err(FluxError::runtime(format!(
                    "unknown method `.{method}` on {}",
                    receiver.type_name()
                )))
            }
            // ---- Number methods ----------------------------------------
            (Value::Number(n), "abs") => Ok(Value::Number(n.abs())),
            (Value::Number(n), "floor") => Ok(Value::Number(n.floor())),
            (Value::Number(n), "ceil") => Ok(Value::Number(n.ceil())),
            (Value::Number(n), "round") => Ok(Value::Number(n.round())),
            (Value::Number(n), "sqrt") => Ok(Value::Number(n.sqrt())),
            (Value::Number(n), "pow") => {
                let exp = args
                    .first()
                    .and_then(|v| {
                        if let Value::Number(x) = v {
                            Some(*x)
                        } else {
                            None
                        }
                    })
                    .unwrap_or(1.0);
                Ok(Value::Number(n.powf(exp)))
            }
            (Value::Number(n), "to_text") => Ok(Value::Text(format!("{}", Value::Number(*n)))),
            (Value::Number(n), "is_integer") => Ok(Value::Bool(n.fract() == 0.0)),
            // ---- General -----------------------------------------------
            (_, "to_text") => Ok(Value::Text(receiver.to_string())),
            (_, "type") => Ok(Value::Text(receiver.type_name().to_string())),
            _ => Err(FluxError::runtime(format!(
                "unknown method `.{method}` on {}",
                receiver.type_name()
            ))),
        }
    }
} // impl FastVM

// ---------------------------------------------------------------------------
// Helper functions (module-level, not methods)
// ---------------------------------------------------------------------------

fn val_cmp_gt(a: &Value, b: &Value) -> Result<bool, FluxError> {
    match (a, b) {
        (Value::Number(a), Value::Number(b)) => Ok(a > b),
        (Value::Text(a), Value::Text(b)) => Ok(a > b),
        _ => Err(FluxError::runtime("cannot compare these types")),
    }
}
fn val_cmp_ge(a: &Value, b: &Value) -> Result<bool, FluxError> {
    match (a, b) {
        (Value::Number(a), Value::Number(b)) => Ok(a >= b),
        (Value::Text(a), Value::Text(b)) => Ok(a >= b),
        _ => Err(FluxError::runtime("cannot compare these types")),
    }
}
fn val_cmp_lt(a: &Value, b: &Value) -> Result<bool, FluxError> {
    match (a, b) {
        (Value::Number(a), Value::Number(b)) => Ok(a < b),
        (Value::Text(a), Value::Text(b)) => Ok(a < b),
        _ => Err(FluxError::runtime("cannot compare these types")),
    }
}
fn val_cmp_le(a: &Value, b: &Value) -> Result<bool, FluxError> {
    match (a, b) {
        (Value::Number(a), Value::Number(b)) => Ok(a <= b),
        (Value::Text(a), Value::Text(b)) => Ok(a <= b),
        _ => Err(FluxError::runtime("cannot compare these types")),
    }
}

fn bitop(a: &Value, b: &Value, op: impl Fn(i64, i64) -> i64) -> Result<Value, FluxError> {
    if let (Value::Number(a), Value::Number(b)) = (a, b) {
        Ok(Value::Number(op(*a as i64, *b as i64) as f64))
    } else {
        Err(FluxError::runtime("bitwise operations require numbers"))
    }
}

fn seed_rng_state() -> u64 {
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64;
    let seed = nanos ^ 0x9E37_79B9_7F4A_7C15u64;
    if seed == 0 {
        0xA5A5_A5A5_5A5A_5A5A
    } else {
        seed
    }
}

fn gcd_i64(mut a: i64, mut b: i64) -> i64 {
    a = a.abs();
    b = b.abs();
    while b != 0 {
        let r = a % b;
        a = b;
        b = r;
    }
    a
}

fn is_prime_i64(n: i64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }
    let mut d = 3;
    while d * d <= n {
        if n % d == 0 {
            return false;
        }
        d += 2;
    }
    true
}

fn collection_object(kind: &str, items: Vec<Value>) -> Value {
    let mut obj = BTreeMap::new();
    obj.insert("__type".to_string(), Value::Text(kind.to_string()));
    obj.insert("items".to_string(), Value::List(items));
    Value::Object(obj)
}

fn collection_kind(obj: &BTreeMap<String, Value>) -> Option<&str> {
    obj.get("__type").and_then(|v| {
        if let Value::Text(kind) = v {
            Some(kind.as_str())
        } else {
            None
        }
    })
}

fn collection_items(obj: &BTreeMap<String, Value>) -> Vec<Value> {
    obj.get("items")
        .and_then(|v| {
            if let Value::List(items) = v {
                Some(items.clone())
            } else {
                None
            }
        })
        .unwrap_or_default()
}

fn parse_csv_value(text: &str) -> Value {
    let mut rows = Vec::new();
    let mut row = Vec::new();
    let mut field = String::new();
    let mut chars = text.chars().peekable();
    let mut in_quotes = false;

    while let Some(ch) = chars.next() {
        match ch {
            '"' if in_quotes && chars.peek() == Some(&'"') => {
                field.push('"');
                chars.next();
            }
            '"' => in_quotes = !in_quotes,
            ',' if !in_quotes => {
                row.push(Value::Text(field.clone()));
                field.clear();
            }
            '\n' if !in_quotes => {
                row.push(Value::Text(field.trim_end_matches('\r').to_string()));
                field.clear();
                rows.push(Value::List(row));
                row = Vec::new();
            }
            ch => field.push(ch),
        }
    }

    if !field.is_empty() || !row.is_empty() || text.ends_with(',') {
        row.push(Value::Text(field.trim_end_matches('\r').to_string()));
        rows.push(Value::List(row));
    }

    Value::List(rows)
}

fn stringify_csv_value(value: &Value) -> Result<String, FluxError> {
    let Value::List(rows) = value else {
        return Err(FluxError::runtime("stringify_csv requires a list of rows"));
    };
    let mut out_rows = Vec::with_capacity(rows.len());
    for row in rows {
        let Value::List(fields) = row else {
            return Err(FluxError::runtime("stringify_csv requires a list of rows"));
        };
        let encoded = fields
            .iter()
            .map(|field| {
                let text = field.to_string();
                if text.contains([',', '"', '\n', '\r']) {
                    format!("\"{}\"", text.replace('"', "\"\""))
                } else {
                    text
                }
            })
            .collect::<Vec<_>>();
        out_rows.push(encoded.join(","));
    }
    Ok(out_rows.join("\n"))
}

/// Load a built-in standard library module or an external .ez file.
fn load_module_builtin(path: &str) -> Result<std::collections::HashMap<String, Value>, FluxError> {
    let mut module = std::collections::HashMap::new();
    match path {
        "std/math" => {
            module.insert("pi".into(), Value::Number(std::f64::consts::PI));
            module.insert("e".into(), Value::Number(std::f64::consts::E));
            module.insert("tau".into(), Value::Number(std::f64::consts::TAU));
        }
        "std/io" => {
            // Placeholder – builtins are already globally available.
        }
        "std/string" => {}
        "std/json" => {}
        "std/os" => {}
        "std/datetime" => {}
        "std/types" => {}
        _ => {
            // Try loading as a .ez file.
            let try_paths = [
                format!("{path}.ez"),
                format!("std/{path}.ez"),
                path.to_string(),
            ];
            for p in &try_paths {
                if let Ok(source) = std::fs::read_to_string(p) {
                    let program = crate::parser::parse(&source).map_err(|e| {
                        FluxError::runtime(format!("error in module `{path}`: {e}"))
                    })?;
                    let mut vm = FastVM::new();
                    vm.compile_and_run(&program).map_err(|e| {
                        FluxError::runtime(format!("runtime error in module `{path}`: {e}"))
                    })?;
                    let mut module = vm.env.get_all();
                    if let Some(Value::List(exports)) = module.get("__exports") {
                        let exported: std::collections::HashSet<String> = exports
                            .iter()
                            .filter_map(|v| {
                                if let Value::Text(name) = v {
                                    Some(name.clone())
                                } else {
                                    None
                                }
                            })
                            .collect();
                        if !exported.is_empty() {
                            module.retain(|name, _| name == "__exports" || exported.contains(name));
                        }
                    }
                    module.remove("__exports");
                    return Ok(module);
                }
            }
            return Err(FluxError::runtime(format!("module `{path}` not found")));
        }
    }
    Ok(module)
}

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

fn json_parse(s: &str) -> Result<Value, FluxError> {
    let v: serde_json::Value =
        serde_json::from_str(s).map_err(|e| FluxError::runtime(format!("invalid JSON: {e}")))?;
    Ok(json_val_to_ezra(v))
}

fn json_val_to_ezra(v: serde_json::Value) -> Value {
    match v {
        serde_json::Value::Null => Value::Nothing,
        serde_json::Value::Bool(b) => Value::Bool(b),
        serde_json::Value::Number(n) => Value::Number(n.as_f64().unwrap_or(0.0)),
        serde_json::Value::String(s) => Value::Text(s),
        serde_json::Value::Array(arr) => {
            Value::List(arr.into_iter().map(json_val_to_ezra).collect())
        }
        serde_json::Value::Object(obj) => {
            let mut m = BTreeMap::new();
            for (k, v) in obj {
                m.insert(k, json_val_to_ezra(v));
            }
            Value::Object(m)
        }
    }
}

fn json_stringify(v: &Value) -> Result<Value, FluxError> {
    let j = ezra_val_to_json(v);
    serde_json::to_string(&j)
        .map(Value::Text)
        .map_err(|e| FluxError::runtime(format!("JSON stringify failed: {e}")))
}

fn ezra_val_to_json(v: &Value) -> serde_json::Value {
    match v {
        Value::Nothing => serde_json::Value::Null,
        Value::Bool(b) => serde_json::Value::Bool(*b),
        Value::Number(n) => serde_json::json!(*n),
        Value::Text(s) => serde_json::Value::String(s.clone()),
        Value::List(items) => {
            serde_json::Value::Array(items.iter().map(ezra_val_to_json).collect())
        }
        Value::Object(map) => {
            let mut obj = serde_json::Map::new();
            for (k, v) in map {
                obj.insert(k.clone(), ezra_val_to_json(v));
            }
            serde_json::Value::Object(obj)
        }
        Value::Function(_) | Value::CompiledFn(_) | Value::Module(_) => serde_json::Value::Null,
    }
}

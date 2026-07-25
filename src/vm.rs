use crate::bytecode::*;
use crate::environment::Environment;
use crate::error::EzraError as FluxError;
use crate::value::*;
use std::collections::BTreeMap;

pub struct ExprVM;

#[allow(dead_code)]
impl ExprVM {
    pub fn eval(instrs: &[Instr], env: &mut Environment) -> Result<Value, FluxError> {
        let mut stack: Vec<Value> = vec![];
        // Helper to pop a value with error on underflow
        let pop_checked = |stack: &mut Vec<Value>| -> Result<Value, FluxError> {
            stack
                .pop()
                .ok_or_else(|| FluxError::runtime("stack underflow"))
        };
        for instr in instrs {
            match instr {
                Instr::Const(v) => {
                    // Never interpolate here — the Interpolate instruction handles that.
                    // Interpolation in Const was a bug that corrupted literal strings
                    // containing '{'.
                    stack.push(v.clone());
                }
                Instr::Load(name, line) => {
                    let v = env.get(name).ok_or_else(|| {
                        FluxError::runtime_at(format!("undefined variable `{name}`"), *line, 1)
                    })?;
                    stack.push(v);
                }
                Instr::MakeList(n) => {
                    let mut items: Vec<Value> = Vec::with_capacity(*n);
                    for _ in 0..*n {
                        items.push(pop_checked(&mut stack)?);
                    }
                    items.reverse();
                    stack.push(Value::List(items));
                }
                Instr::MakeObject(n) => {
                    let mut map = BTreeMap::new();
                    for _ in 0..*n {
                        let val = pop_checked(&mut stack)?;
                        let key = pop_checked(&mut stack)?;
                        if let Value::Text(k) = key {
                            map.insert(k, val);
                        }
                    }
                    stack.push(Value::Object(map));
                }
                Instr::Input => {
                    let prompt = pop_checked(&mut stack)?;
                    print!("{prompt}");
                    use std::io::Write;
                    std::io::stdout().flush().ok();
                    let mut input = String::new();
                    std::io::stdin().read_line(&mut input).ok();
                    stack.push(Value::Text(input.trim().to_string()));
                }
                Instr::InputNumber => {
                    let prompt = pop_checked(&mut stack)?;
                    print!("{prompt}");
                    use std::io::Write;
                    std::io::stdout().flush().ok();
                    let mut input = String::new();
                    std::io::stdin().read_line(&mut input).ok();
                    let n: f64 = input.trim().parse().unwrap_or(0.0);
                    stack.push(Value::Number(n));
                }
                Instr::Neg => {
                    let a = pop_checked(&mut stack)?;
                    if let Value::Number(n) = a {
                        stack.push(Value::Number(-n));
                    } else {
                        return Err(FluxError::runtime("cannot negate value"));
                    }
                }
                Instr::Not => {
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(!a.is_truthy()));
                }
                Instr::Add => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(match (&a, &b) {
                        (Value::Number(a), Value::Number(b)) => Value::Number(a + b),
                        (Value::Text(a), Value::Text(b)) => Value::Text(format!("{a}{b}")),
                        (Value::Text(a), Value::Number(b)) => Value::Text(format!("{a}{b}")),
                        (Value::Number(a), Value::Text(b)) => Value::Text(format!("{a}{b}")),
                        (Value::List(a), Value::List(b)) => {
                            let mut r = a.clone();
                            r.extend_from_slice(b);
                            Value::List(r)
                        }
                        _ => return Err(FluxError::runtime("cannot add values")),
                    });
                }
                Instr::Sub => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number(av - bv));
                    } else {
                        return Err(FluxError::runtime("cannot subtract"));
                    }
                }
                Instr::Mul => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number(av * bv));
                    } else {
                        return Err(FluxError::runtime("cannot multiply"));
                    }
                }
                Instr::Div => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        if *bv == 0.0 {
                            return Err(FluxError::runtime("divide by zero"));
                        }
                        stack.push(Value::Number(av / bv));
                    } else {
                        return Err(FluxError::runtime("cannot divide"));
                    }
                }
                Instr::Mod => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        if *bv == 0.0 {
                            return Err(FluxError::runtime("remainder by zero"));
                        }
                        stack.push(Value::Number(av % bv));
                    } else {
                        return Err(FluxError::runtime("cannot mod values"));
                    }
                }
                Instr::Pow => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number(av.powf(*bv)));
                    } else {
                        return Err(FluxError::runtime("cannot pow"));
                    }
                }
                Instr::Gt => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(match (&a, &b) {
                        (Value::Number(av), Value::Number(bv)) => av > bv,
                        (Value::Text(av), Value::Text(bv)) => av > bv,
                        _ => return Err(FluxError::runtime("cannot compare")),
                    }));
                }
                Instr::Ge => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(match (&a, &b) {
                        (Value::Number(av), Value::Number(bv)) => av >= bv,
                        (Value::Text(av), Value::Text(bv)) => av >= bv,
                        _ => return Err(FluxError::runtime("cannot compare")),
                    }));
                }
                Instr::Lt => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(match (&a, &b) {
                        (Value::Number(av), Value::Number(bv)) => av < bv,
                        (Value::Text(av), Value::Text(bv)) => av < bv,
                        _ => return Err(FluxError::runtime("cannot compare")),
                    }));
                }
                Instr::Le => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(match (&a, &b) {
                        (Value::Number(av), Value::Number(bv)) => av <= bv,
                        (Value::Text(av), Value::Text(bv)) => av <= bv,
                        _ => return Err(FluxError::runtime("cannot compare")),
                    }));
                }
                Instr::Eq => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(a == b));
                }
                Instr::Ne => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(a != b));
                }
                Instr::And => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(a.is_truthy() && b.is_truthy()));
                }
                Instr::Or => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    stack.push(Value::Bool(a.is_truthy() || b.is_truthy()));
                }
                Instr::BitAnd => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number((*av as i64 & *bv as i64) as f64));
                    } else {
                        return Err(FluxError::runtime("cannot bitwise-and"));
                    }
                }
                Instr::BitOr => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number((*av as i64 | *bv as i64) as f64));
                    } else {
                        return Err(FluxError::runtime("cannot bitwise-or"));
                    }
                }
                Instr::BitXor => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number((*av as i64 ^ *bv as i64) as f64));
                    } else {
                        return Err(FluxError::runtime("cannot bitwise-xor"));
                    }
                }
                Instr::Shl => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        let shift = (*av as i64) << (*bv as i64);
                        stack.push(Value::Number(shift as f64));
                    } else {
                        return Err(FluxError::runtime("cannot shift"));
                    }
                }
                Instr::Shr => {
                    let b = pop_checked(&mut stack)?;
                    let a = pop_checked(&mut stack)?;
                    if let (Value::Number(av), Value::Number(bv)) = (&a, &b) {
                        stack.push(Value::Number(((*av as i64) >> (*bv as i64)) as f64));
                    } else {
                        return Err(FluxError::runtime("cannot shift"));
                    }
                }
                Instr::BitNot => {
                    let a = pop_checked(&mut stack)?;
                    if let Value::Number(n) = a {
                        stack.push(Value::Number(!(n as i64) as f64));
                    } else {
                        return Err(FluxError::runtime("cannot bitwise-not"));
                    }
                }
                Instr::Index => {
                    let idx = pop_checked(&mut stack)?;
                    let target = pop_checked(&mut stack)?;
                    match &target {
                        Value::List(list) => {
                            if let Value::Number(i) = &idx {
                                if *i < 0.0 {
                                    return Err(FluxError::runtime(
                                        "list index must be a non-negative integer",
                                    ));
                                }
                                if i.fract() != 0.0 {
                                    return Err(FluxError::runtime(
                                        "list index must be a non-negative integer",
                                    ));
                                }
                                let i = *i as usize;
                                stack.push(if i < list.len() {
                                    list[i].clone()
                                } else {
                                    Value::Nothing
                                });
                            } else {
                                return Err(FluxError::runtime(
                                    "list index must be a non-negative integer",
                                ));
                            }
                        }
                        Value::Text(s) => {
                            if let Value::Number(i) = &idx {
                                if *i < 0.0 {
                                    return Err(FluxError::runtime(
                                        "text index must be a non-negative integer",
                                    ));
                                }
                                if i.fract() != 0.0 {
                                    return Err(FluxError::runtime(
                                        "text index must be a non-negative integer",
                                    ));
                                }
                                let i = *i as usize;
                                if i < s.len() {
                                    if let Some(ch) = s.chars().nth(i) {
                                        stack.push(Value::Text(ch.to_string()));
                                    } else {
                                        stack.push(Value::Nothing);
                                    }
                                } else {
                                    stack.push(Value::Nothing);
                                }
                            } else {
                                return Err(FluxError::runtime(
                                    "text index must be a non-negative integer",
                                ));
                            }
                        }
                        _ => return Err(FluxError::runtime("cannot index")),
                    }
                }
                Instr::IndexSet => {
                    let val = pop_checked(&mut stack)?;
                    let idx = pop_checked(&mut stack)?;
                    let target = pop_checked(&mut stack)?;
                    if let Value::List(mut list) = target {
                        if let Value::Number(i) = &idx {
                            if *i < 0.0 {
                                return Err(FluxError::runtime(
                                    "list index must be a non-negative integer",
                                ));
                            }
                            if i.fract() != 0.0 {
                                return Err(FluxError::runtime(
                                    "list index must be a non-negative integer",
                                ));
                            }
                            let i = *i as usize;
                            if i < list.len() {
                                list[i] = val;
                                stack.push(Value::List(list));
                            } else {
                                return Err(FluxError::runtime("index out of bounds"));
                            }
                        } else {
                            return Err(FluxError::runtime(
                                "list index must be a non-negative integer",
                            ));
                        }
                    } else {
                        return Err(FluxError::runtime("cannot index-set"));
                    }
                }
                Instr::Property(name) => {
                    let target = pop_checked(&mut stack)?;
                    let v = match &target {
                        Value::Object(obj) => obj.get(name).cloned().unwrap_or(Value::Nothing),
                        Value::Module(mod_map) => {
                            mod_map.get(name).cloned().unwrap_or(Value::Nothing)
                        }
                        _ => env.get(name).unwrap_or(Value::Nothing),
                    };
                    stack.push(v);
                }
                Instr::Call(_n) => {
                    let callee = pop_checked(&mut stack)?;
                    match callee {
                        Value::Function(_func) => {
                            return Err(FluxError::runtime(
                                "user function calls NYI in expression VM",
                            ));
                        }
                        _ => {
                            return Err(FluxError::runtime("cannot call non-function value"));
                        }
                    }
                }
                Instr::Builtin(name, n) => {
                    let mut args: Vec<Value> = Vec::with_capacity(*n);
                    for _ in 0..*n {
                        args.push(pop_checked(&mut stack)?);
                    }
                    args.reverse();
                    let result = Self::call_builtin(name, &args, env)?;
                    stack.push(result);
                }
                Instr::Interpolate(n) => {
                    let mut result = String::new();
                    for _ in 0..*n {
                        let v = pop_checked(&mut stack)?;
                        result = format!("{v}{result}");
                    }
                    stack.push(Value::Text(result));
                }
                Instr::SizeOf => {
                    let v = pop_checked(&mut stack)?;
                    stack.push(match &v {
                        Value::Text(s) => Value::Number(s.len() as f64),
                        Value::List(l) => Value::Number(l.len() as f64),
                        Value::Object(m) => Value::Number(m.len() as f64),
                        _ => Value::Number(1.0),
                    });
                }
                Instr::TypeOf => {
                    let v = pop_checked(&mut stack)?;
                    stack.push(Value::Text(v.type_name().to_string()));
                }
                Instr::Expand => {
                    let v = pop_checked(&mut stack)?;
                    if let Value::List(items) = v {
                        for item in items {
                            stack.push(item);
                        }
                    } else {
                        stack.push(v);
                    }
                }
                Instr::Ternary => {
                    let else_val = pop_checked(&mut stack)?;
                    let then_val = pop_checked(&mut stack)?;
                    let cond = pop_checked(&mut stack)?;
                    stack.push(if cond.is_truthy() { then_val } else { else_val });
                }
                _ => {} // expression VM ignores statement-level instructions
            }
        }
        stack
            .pop()
            .ok_or_else(|| FluxError::runtime("stack empty after expression evaluation"))
    }

    fn call_builtin(name: &str, args: &[Value], env: &mut Environment) -> Result<Value, FluxError> {
        let get_n = |v: &Value| -> Option<f64> {
            if let Value::Number(n) = v {
                Some(*n)
            } else {
                None
            }
        };
        macro_rules! text {
            ($e:expr) => {
                if let Value::Text(s) = $e {
                    s.as_str()
                } else {
                    ""
                }
            };
        }

        match name {
            "len" => {
                let v = &args[0];
                let n = match v {
                    Value::Text(s) => s.len() as f64,
                    Value::List(l) => l.len() as f64,
                    Value::Object(m) => m.len() as f64,
                    _ => 0.0,
                };
                Ok(Value::Number(n))
            }
            "type_of" => Ok(Value::Text(args[0].type_name().to_string())),
            "text" => Ok(Value::Text(format!("{}", args[0]))),
            "number" => {
                let r = match &args[0] {
                    Value::Text(s) => s.trim().parse::<f64>().ok().map(Value::Number),
                    Value::Number(n) => Some(Value::Number(*n)),
                    Value::Bool(true) => Some(Value::Number(1.0)),
                    Value::Bool(false) | Value::Nothing => Some(Value::Number(0.0)),
                    _ => None,
                };
                Ok(r.unwrap_or(Value::Nothing))
            }
            "bool" => Ok(Value::Bool(args[0].is_truthy())),
            "abs" | "sqrt" | "floor" | "ceil" | "round" | "sin" | "cos" | "tan" | "log" | "ln"
            | "log10" | "exp" => {
                let v = get_n(&args[0])
                    .ok_or_else(|| FluxError::runtime(format!("{name} expects number")))?;
                Ok(Value::Number(match name {
                    "abs" => v.abs(),
                    "sqrt" => v.sqrt(),
                    "floor" => v.floor(),
                    "ceil" => v.ceil(),
                    "round" => v.round(),
                    "sin" => v.sin(),
                    "cos" => v.cos(),
                    "tan" => v.tan(),
                    "log" | "ln" => v.ln(),
                    "log10" => v.log10(),
                    "exp" => v.exp(),
                    _ => unreachable!(),
                }))
            }
            "min" | "max" | "pow" => {
                let a = get_n(&args[0])
                    .ok_or_else(|| FluxError::runtime(format!("{name} expects number")))?;
                let b = get_n(&args[1])
                    .ok_or_else(|| FluxError::runtime(format!("{name} expects number")))?;
                Ok(Value::Number(match name {
                    "min" => a.min(b),
                    "max" => a.max(b),
                    _ => a.powf(b),
                }))
            }
            "contains" => {
                let r = match (&args[0], &args[1]) {
                    (Value::Text(s), Value::Text(p)) => s.contains(p.as_str()),
                    (Value::List(l), v) => l.contains(v),
                    _ => false,
                };
                Ok(Value::Bool(r))
            }
            "find" => {
                let p = text!(&args[1]);
                let idx = if let Value::Text(s) = &args[0] {
                    s.find(p)
                } else {
                    None
                };
                Ok(idx
                    .map(|i| Value::Number(i as f64))
                    .unwrap_or(Value::Number(-1.0)))
            }
            "replace" => {
                let s = text!(&args[0]);
                let from = text!(&args[1]);
                let to = match args.get(2) {
                    Some(Value::Text(t)) => t.as_str(),
                    _ => "",
                };
                Ok(Value::Text(s.replace(from, to)))
            }
            "split" => {
                let s = text!(&args[0]);
                let sep = text!(args.get(1).unwrap_or(&args[0]));
                Ok(Value::List(
                    s.split(sep).map(|p| Value::Text(p.to_string())).collect(),
                ))
            }
            "join" => {
                let sep = text!(args.get(1).unwrap_or(&args[0]));
                if let Value::List(list) = &args[0] {
                    Ok(Value::Text(
                        list.iter()
                            .map(|v| format!("{v}"))
                            .collect::<Vec<_>>()
                            .join(sep),
                    ))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "trim" | "upper" | "lower" => {
                if let Value::Text(s) = &args[0] {
                    Ok(Value::Text(match name {
                        "trim" => s.trim().to_string(),
                        "upper" => s.to_uppercase(),
                        _ => s.to_lowercase(),
                    }))
                } else {
                    Err(FluxError::runtime(format!("{name} expects text")))
                }
            }
            "starts_with" | "ends_with" => {
                if let (Value::Text(s), Value::Text(p)) = (&args[0], &args[1]) {
                    Ok(Value::Bool(if name == "starts_with" {
                        s.starts_with(p.as_str())
                    } else {
                        s.ends_with(p.as_str())
                    }))
                } else {
                    Err(FluxError::runtime(format!("{name} expects text")))
                }
            }
            "sort" => {
                if let Value::List(mut l) = args[0].clone() {
                    l.sort_by(|a, b| format!("{a}").cmp(&format!("{b}")));
                    Ok(Value::List(l))
                } else {
                    Ok(args[0].clone())
                }
            }
            "reverse" => {
                if let Value::List(mut l) = args[0].clone() {
                    l.reverse();
                    Ok(Value::List(l))
                } else {
                    Ok(args[0].clone())
                }
            }
            "range" => {
                let end = get_n(&args[0]).unwrap_or(0.0) as i64;
                Ok(Value::List(
                    (0..end).map(|i| Value::Number(i as f64)).collect(),
                ))
            }
            "keys" => {
                if let Value::Object(m) = &args[0] {
                    Ok(Value::List(
                        m.keys().map(|k| Value::Text(k.clone())).collect(),
                    ))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "values" => {
                if let Value::Object(m) = &args[0] {
                    Ok(Value::List(m.values().cloned().collect()))
                } else {
                    Ok(Value::Nothing)
                }
            }
            "has" => {
                let k = text!(&args[1]);
                if let Value::Object(m) = &args[0] {
                    Ok(Value::Bool(m.contains_key(k)))
                } else {
                    Ok(Value::Bool(false))
                }
            }
            "clear" => Ok(match &args[0] {
                Value::List(_) => Value::List(vec![]),
                Value::Object(_) => Value::Object(BTreeMap::new()),
                _ => Value::Nothing,
            }),
            "sleep" => {
                let ms = get_n(&args[0]).unwrap_or(0.0) as u64;
                std::thread::sleep(std::time::Duration::from_millis(ms));
                Ok(Value::Nothing)
            }
            "random" | "random_int" => Ok(Value::Number(0.0)),
            "time" => {
                let d = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default();
                Ok(Value::Number(d.as_secs_f64()))
            }
            "exit" => std::process::exit(get_n(&args[0]).unwrap_or(0.0) as i32),
            "read_file" => {
                let p = text!(&args[0]);
                std::fs::read_to_string(p)
                    .map(Value::Text)
                    .or(Ok(Value::Nothing))
            }
            "write_file" => {
                let p = text!(&args[0]);
                let c = text!(&args[1]);
                std::fs::write(p, c)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("write_file failed: {e}")))
            }
            "append_file" => {
                let p = text!(&args[0]);
                let c = text!(&args[1]);
                use std::io::Write;
                std::fs::OpenOptions::new()
                    .append(true)
                    .create(true)
                    .open(p)
                    .and_then(|mut f| f.write_all(c.as_bytes()))
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("append_file failed: {e}")))
            }
            "file_exists" => {
                let p = text!(&args[0]);
                Ok(Value::Bool(std::path::Path::new(p).exists()))
            }
            "file_delete" => {
                let p = text!(&args[0]);
                std::fs::remove_file(p)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("cannot delete file `{p}`: {e}")))
            }
            "file_copy" => {
                let src = text!(&args[0]);
                let dst = text!(&args[1]);
                std::fs::copy(src, dst)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("file_copy failed: {e}")))
            }
            "file_size" => {
                let p = text!(&args[0]);
                std::fs::metadata(p)
                    .map(|m| Value::Number(m.len() as f64))
                    .or(Ok(Value::Number(0.0)))
            }
            "list_dir" => {
                let p = text!(&args[0]);
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
                let p = text!(&args[0]);
                std::fs::create_dir(p)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("cannot create dir `{p}`: {e}")))
            }
            "parse_json" => {
                let s = text!(&args[0]);
                Self::json_to_value(s)
            }
            "stringify_json" => Self::value_to_json(&args[0]),
            "date_now" => {
                let d = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default();
                let mut map = BTreeMap::new();
                map.insert("unix".to_string(), Value::Number(d.as_secs_f64()));
                Ok(Value::Object(map))
            }
            "format_date" => Ok(Value::Text(format!("{}", args[0]))),
            "env" => {
                let k = text!(&args[0]);
                Ok(std::env::var(k).map(Value::Text).unwrap_or(Value::Nothing))
            }
            "cwd" => std::env::current_dir()
                .map(|p| Value::Text(p.to_string_lossy().to_string()))
                .map_err(|e| FluxError::runtime(format!("cwd failed: {e}"))),
            "args" => {
                let a: Vec<Value> = std::env::args().skip(1).map(Value::Text).collect();
                Ok(Value::List(a))
            }
            "cd" => {
                let p = text!(&args[0]);
                std::env::set_current_dir(p)
                    .map(|_| Value::Nothing)
                    .map_err(|e| FluxError::runtime(format!("cd failed: {e}")))
            }
            "atoi" => {
                let s = text!(&args[0]);
                Ok(s.parse::<i64>()
                    .map(|i| Value::Number(i as f64))
                    .unwrap_or(Value::Nothing))
            }
            "itoa" => Ok(Value::Text(format!("{}", args[0]))),
            "is_number" => Ok(Value::Bool(matches!(&args[0], Value::Number(_)))),
            "is_text" => Ok(Value::Bool(matches!(&args[0], Value::Text(_)))),
            "is_bool" => Ok(Value::Bool(matches!(&args[0], Value::Bool(_)))),
            "is_list" => Ok(Value::Bool(matches!(&args[0], Value::List(_)))),
            "is_object" => Ok(Value::Bool(matches!(&args[0], Value::Object(_)))),
            "is_function" => Ok(Value::Bool(matches!(&args[0], Value::Function(_)))),
            "is_nothing" => Ok(Value::Bool(matches!(&args[0], Value::Nothing))),
            "use_module" | "_import" => {
                let path = text!(&args[0]);
                let source = std::fs::read_to_string(format!("std/{path}.ar"))
                    .or_else(|_| std::fs::read_to_string(path))
                    .map_err(|e| FluxError::runtime(format!("module `{path}` not found: {e}")))?;
                let program = crate::parser::parse(&source)?;
                let mut sub = crate::interpreter::Interpreter::new();
                sub.run(&program)
                    .map_err(|e| FluxError::runtime(format!("module error: {e}")))?;
                let vars = sub.get_all_env();
                for (n, v) in &vars {
                    env.define(n, v.clone());
                }
                Ok(Value::Nothing)
            }
            _ => Err(FluxError::runtime(format!("unknown builtin `{name}`"))),
        }
    }

    fn interpolate(text: &str, env: &mut Environment) -> Result<Value, FluxError> {
        let mut output = String::new();
        let chars: Vec<char> = text.chars().collect();
        let mut i = 0;
        while i < chars.len() {
            if chars[i] == '{' {
                let start = i + 1;
                let mut end = start;
                while end < chars.len() && chars[end] != '}' {
                    end += 1;
                }
                if end >= chars.len() {
                    return Err(FluxError::runtime("unterminated interpolation"));
                }
                let expr_text: String = chars[start..end].iter().collect();
                let expr_text = expr_text.trim();
                if let Some(val) = env.get(expr_text) {
                    output.push_str(&val.to_string());
                } else {
                    // Try to parse and evaluate as a more complex expression
                    let wrapped = format!("__val is {expr_text}");
                    if let Ok(program) = crate::parser::parse(&wrapped) {
                        if let crate::ast::Stmt::Assign { expr, .. } = &program.statements[0] {
                            let chunk = Self::compile_expr_simple(expr);
                            if let Ok(val) = Self::eval(&chunk, env) {
                                output.push_str(&val.to_string());
                            } else {
                                output.push_str(&format!("{{{expr_text}}}"));
                            }
                        } else {
                            output.push_str(&format!("{{{expr_text}}}"));
                        }
                    } else {
                        output.push_str(&format!("{{{expr_text}}}"));
                    }
                }
                i = end + 1;
            } else {
                output.push(chars[i]);
                i += 1;
            }
        }
        Ok(Value::Text(output))
    }

    fn compile_expr_simple(expr: &crate::ast::Expr) -> Vec<Instr> {
        let mut instrs = vec![];
        Self::compile_expr_to(expr, &mut instrs);
        instrs
    }

    fn compile_expr_to(expr: &crate::ast::Expr, instrs: &mut Vec<Instr>) {
        match expr {
            crate::ast::Expr::Number(n) => instrs.push(Instr::Const(Value::Number(*n))),
            crate::ast::Expr::Text(s) => instrs.push(Instr::Const(Value::Text(s.clone()))),
            crate::ast::Expr::Bool(b) => instrs.push(Instr::Const(Value::Bool(*b))),
            crate::ast::Expr::Nothing => instrs.push(Instr::Const(Value::Nothing)),
            crate::ast::Expr::Variable { name, line } => {
                instrs.push(Instr::Load(name.clone(), *line))
            }
            crate::ast::Expr::Unary { op, right } => {
                Self::compile_expr_to(right, instrs);
                instrs.push(match op {
                    crate::ast::UnaryOp::Negate => Instr::Neg,
                    crate::ast::UnaryOp::Not => Instr::Not,
                });
            }
            crate::ast::Expr::Binary { left, op, right } => {
                Self::compile_expr_to(left, instrs);
                Self::compile_expr_to(right, instrs);
                instrs.push(match op {
                    crate::ast::BinaryOp::Add => Instr::Add,
                    crate::ast::BinaryOp::Subtract => Instr::Sub,
                    crate::ast::BinaryOp::Multiply => Instr::Mul,
                    crate::ast::BinaryOp::Divide => Instr::Div,
                    crate::ast::BinaryOp::Remainder => Instr::Mod,
                    crate::ast::BinaryOp::Power => Instr::Pow,
                    crate::ast::BinaryOp::Greater => Instr::Gt,
                    crate::ast::BinaryOp::GreaterEqual => Instr::Ge,
                    crate::ast::BinaryOp::Less => Instr::Lt,
                    crate::ast::BinaryOp::LessEqual => Instr::Le,
                    crate::ast::BinaryOp::Equal => Instr::Eq,
                    crate::ast::BinaryOp::NotEqual => Instr::Ne,
                    crate::ast::BinaryOp::And => Instr::And,
                    crate::ast::BinaryOp::Or => Instr::Or,
                    crate::ast::BinaryOp::BitwiseAnd => Instr::BitAnd,
                    crate::ast::BinaryOp::BitwiseOr => Instr::BitOr,
                    crate::ast::BinaryOp::BitwiseXor => Instr::BitXor,
                    crate::ast::BinaryOp::ShiftLeft => Instr::Shl,
                    crate::ast::BinaryOp::ShiftRight => Instr::Shr,
                });
            }
            crate::ast::Expr::Grouping(inner) => Self::compile_expr_to(inner, instrs),
            crate::ast::Expr::Call { callee, args } => {
                if let crate::ast::Expr::Variable { name, .. } = callee.as_ref() {
                    const INTERP_BUILTINS: &[&str] = &[
                        "len",
                        "abs",
                        "sqrt",
                        "sin",
                        "cos",
                        "tan",
                        "text",
                        "number",
                        "bool",
                        "upper",
                        "lower",
                        "trim",
                        "keys",
                        "values",
                        "type_of",
                        "round",
                        "floor",
                        "ceil",
                        "min",
                        "max",
                        "pow",
                        "contains",
                        "find",
                        "replace",
                        "split",
                        "join",
                        "starts_with",
                        "ends_with",
                        "reverse",
                        "sort",
                        "range",
                        "has",
                        "clear",
                        "size_of",
                        "date_now",
                        "time",
                        "env",
                        "cwd",
                        "args",
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
                        "random",
                        "random_int",
                    ];
                    if INTERP_BUILTINS.contains(&name.as_str()) {
                        for arg in args {
                            Self::compile_expr_to(arg, instrs);
                        }
                        instrs.push(Instr::Builtin(name.clone(), args.len()));
                        return;
                    }
                }
                Self::compile_expr_to(callee, instrs);
                for arg in args {
                    Self::compile_expr_to(arg, instrs);
                }
                instrs.push(Instr::Call(args.len()));
            }
            crate::ast::Expr::Property { target, name } => {
                Self::compile_expr_to(target, instrs);
                instrs.push(Instr::Property(name.clone()));
            }
            crate::ast::Expr::Index { target, index } => {
                Self::compile_expr_to(target, instrs);
                Self::compile_expr_to(index, instrs);
                instrs.push(Instr::Index);
            }
            crate::ast::Expr::Ternary {
                condition,
                then_expr,
                else_expr,
            } => {
                Self::compile_expr_to(condition, instrs);
                Self::compile_expr_to(then_expr, instrs);
                Self::compile_expr_to(else_expr, instrs);
                instrs.push(Instr::Ternary);
            }
            crate::ast::Expr::List(items) => {
                for item in items {
                    Self::compile_expr_to(item, instrs);
                }
                instrs.push(Instr::MakeList(items.len()));
            }
            crate::ast::Expr::Object(fields) => {
                for (key, val) in fields {
                    instrs.push(Instr::Const(Value::Text(key.clone())));
                    Self::compile_expr_to(val, instrs);
                }
                instrs.push(Instr::MakeObject(fields.len()));
            }
            crate::ast::Expr::SizeOf(inner) => {
                Self::compile_expr_to(inner, instrs);
                instrs.push(Instr::SizeOf);
            }
            crate::ast::Expr::TypeOf(inner) => {
                Self::compile_expr_to(inner, instrs);
                instrs.push(Instr::TypeOf);
            }
            _ => {}
        }
    }

    fn json_to_value(s: &str) -> Result<Value, FluxError> {
        let s = s.trim();
        if s.starts_with('{') {
            let inner = &s[1..s.len().max(1) - 1].trim();
            if inner.is_empty() {
                return Ok(Value::Object(BTreeMap::new()));
            }
            let mut map = BTreeMap::new();
            let items = Self::comma_split(inner);
            for item in items {
                let parts: Vec<&str> = item.splitn(2, ':').collect();
                if parts.len() == 2 {
                    let key = parts[0].trim().trim_matches('"').to_string();
                    let val = Self::json_to_value(parts[1].trim())?;
                    map.insert(key, val);
                }
            }
            Ok(Value::Object(map))
        } else if s.starts_with('[') {
            let inner = &s[1..s.len().max(1) - 1].trim();
            if inner.is_empty() {
                return Ok(Value::List(vec![]));
            }
            let items = Self::comma_split(inner);
            let list: Result<Vec<_>, _> = items
                .iter()
                .map(|i| Self::json_to_value(i.trim()))
                .collect();
            Ok(Value::List(list?))
        } else if s.starts_with('"') {
            Ok(Value::Text(s.trim_matches('"').to_string()))
        } else if s == "true" || s == "yes" {
            Ok(Value::Bool(true))
        } else if s == "false" || s == "no" {
            Ok(Value::Bool(false))
        } else if s == "null" || s == "nothing" {
            Ok(Value::Nothing)
        } else {
            s.parse::<f64>().map(Value::Number).or(Ok(Value::Nothing))
        }
    }

    fn comma_split(s: &str) -> Vec<String> {
        let mut result = vec![];
        let mut depth = 0i32;
        let mut start = 0usize;
        for (i, c) in s.char_indices() {
            match c {
                '{' | '[' => depth += 1,
                '}' | ']' => depth -= 1,
                ',' if depth == 0 => {
                    result.push(s[start..i].to_string());
                    start = i + 1;
                }
                _ => {}
            }
        }
        if start < s.len() {
            result.push(s[start..].to_string());
        }
        result
    }

    fn value_to_json(v: &Value) -> Result<Value, FluxError> {
        Ok(match v {
            Value::Number(n) => Value::Text(if n.fract() == 0.0 {
                format!("{}", *n as i64)
            } else {
                format!("{n}")
            }),
            Value::Text(s) => Value::Text(format!(
                "\"{}\"",
                s.replace('\\', "\\\\").replace('"', "\\\"")
            )),
            Value::Bool(true) => Value::Text("true".to_string()),
            Value::Bool(false) => Value::Text("false".to_string()),
            Value::Nothing => Value::Text("null".to_string()),
            Value::List(l) => {
                let items: Vec<String> = l
                    .iter()
                    .map(|item| {
                        Self::value_to_json(item)
                            .map(|v| {
                                if let Value::Text(s) = v {
                                    s
                                } else {
                                    format!("{v}")
                                }
                            })
                            .unwrap_or_default()
                    })
                    .collect();
                Value::Text(format!("[{}]", items.join(", ")))
            }
            Value::Object(map) => {
                let items: Vec<String> = map
                    .iter()
                    .map(|(k, v)| {
                        let vs = Self::value_to_json(v)
                            .map(|vv| {
                                if let Value::Text(s) = vv {
                                    s
                                } else {
                                    format!("{vv}")
                                }
                            })
                            .unwrap_or_default();
                        format!("\"{k}\": {vs}")
                    })
                    .collect();
                Value::Text(format!("{{{}}}", items.join(", ")))
            }
            _ => Value::Text(format!("\"{v}\"")),
        })
    }
}

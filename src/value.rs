use std::collections::BTreeMap;
use std::fmt;
use std::rc::Rc;

use crate::ast::Stmt;

#[derive(Debug, Clone)]
pub struct FunctionValue {
    pub name: String,
    pub params: Vec<String>,
    pub body: Vec<Stmt>,
}

#[derive(Debug, Clone)]
pub enum Value {
    Number(f64),
    Text(String),
    Bool(bool),
    Nothing,
    List(Vec<Value>),
    Object(BTreeMap<String, Value>),
    Function(Rc<FunctionValue>),
    Module(std::collections::HashMap<String, Value>),
    /// A compiled function identified by its index in `Program::functions`.
    /// Used exclusively by FastVM; never exposed to user code.
    CompiledFn(usize),
}

impl Value {
    pub fn is_truthy(&self) -> bool {
        match self {
            Value::Bool(value) => *value,
            Value::Nothing => false,
            Value::Number(value) => *value != 0.0,
            Value::Text(value) => !value.is_empty(),
            Value::List(value) => !value.is_empty(),
            Value::Object(value) => !value.is_empty(),
            Value::Function(_) => true,
            Value::Module(_) => true,
            Value::CompiledFn(_) => true,
        }
    }

    pub fn type_name(&self) -> &'static str {
        match self {
            Value::Number(_) => "number",
            Value::Text(_) => "text",
            Value::Bool(_) => "bool",
            Value::Nothing => "nothing",
            Value::List(_) => "list",
            Value::Object(_) => "object",
            Value::Function(_) => "function",
            Value::Module(_) => "module",
            Value::CompiledFn(_) => "function",
        }
    }
}

impl PartialEq for Value {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Value::Number(a), Value::Number(b)) => a == b,
            (Value::Text(a), Value::Text(b)) => a == b,
            (Value::Bool(a), Value::Bool(b)) => a == b,
            (Value::Nothing, Value::Nothing) => true,
            (Value::List(a), Value::List(b)) => a == b,
            (Value::Object(a), Value::Object(b)) => a == b,
            (Value::Function(a), Value::Function(b)) => Rc::ptr_eq(a, b),
            (Value::CompiledFn(a), Value::CompiledFn(b)) => a == b,
            _ => false,
        }
    }
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Value::Number(value) => {
                if value.is_nan() {
                    write!(f, "nan")
                } else if value.is_infinite() {
                    if *value > 0.0 {
                        write!(f, "infinity")
                    } else {
                        write!(f, "-infinity")
                    }
                } else if value.fract() == 0.0 && value.abs() < 1e15 {
                    // Safe range for lossless i64 representation.
                    write!(f, "{}", *value as i64)
                } else {
                    write!(f, "{value}")
                }
            }
            Value::Text(value) => write!(f, "{value}"),
            Value::Bool(true) => write!(f, "yes"),
            Value::Bool(false) => write!(f, "no"),
            Value::Nothing => write!(f, "nothing"),
            Value::List(values) => {
                write!(f, "[")?;
                for (index, value) in values.iter().enumerate() {
                    if index > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{value}")?;
                }
                write!(f, "]")
            }
            Value::Object(values) => {
                write!(f, "{{")?;
                for (index, (key, value)) in values.iter().enumerate() {
                    if index > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{key}: {value}")?;
                }
                write!(f, "}}")
            }
            Value::Function(function) => write!(f, "<function {}>", function.name),
            Value::Module(_) => write!(f, "<module>"),
            Value::CompiledFn(_) => write!(f, "<function>"),
        }
    }
}

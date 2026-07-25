use std::collections::HashMap;

use crate::error::EzraError as FluxError;
use crate::value::Value;

/// A single scope frame: variable bindings + which names are const in this frame.
#[derive(Debug, Clone)]
struct Scope {
    vars: HashMap<String, Value>,
    consts: std::collections::HashSet<String>,
}

impl Scope {
    fn new() -> Self {
        Self {
            vars: HashMap::new(),
            consts: std::collections::HashSet::new(),
        }
    }
}

/// Lexically-scoped variable environment.
/// Constants are scoped correctly: a `const` defined inside a function disappears
/// when that scope is popped, and cannot shadow outer variables of the same name
/// as writeable after the scope exits.
#[derive(Debug, Clone)]
pub struct Environment {
    scopes: Vec<Scope>,
}

impl Environment {
    pub fn new() -> Self {
        Self {
            scopes: vec![Scope::new()],
        }
    }

    pub fn push_scope(&mut self) {
        self.scopes.push(Scope::new());
    }

    pub fn pop_scope(&mut self) {
        if self.scopes.len() > 1 {
            self.scopes.pop();
        }
    }

    fn current_scope_mut(&mut self) -> &mut Scope {
        if self.scopes.is_empty() {
            self.scopes.push(Scope::new());
        }
        let last = self.scopes.len() - 1;
        &mut self.scopes[last]
    }

    /// Define a new variable in the innermost scope.
    pub fn define(&mut self, name: impl Into<String>, value: Value) {
        self.current_scope_mut().vars.insert(name.into(), value);
    }

    /// Define a constant in the innermost scope.
    pub fn define_const(&mut self, name: impl Into<String>, value: Value) {
        let name = name.into();
        let scope = self.current_scope_mut();
        scope.consts.insert(name.clone());
        scope.vars.insert(name, value);
    }

    /// Assign to an existing variable anywhere in the scope chain.
    /// If the name does not exist yet, it is created in the innermost scope
    /// (same behaviour as before – undeclared assignment creates a new binding).
    pub fn assign(&mut self, name: &str, value: Value) -> Result<(), FluxError> {
        // Walk from innermost outward to find the existing binding.
        for scope in self.scopes.iter_mut().rev() {
            if scope.vars.contains_key(name) {
                if scope.consts.contains(name) {
                    return Err(FluxError::runtime(format!(
                        "cannot assign to constant `{name}`"
                    )));
                }
                scope.vars.insert(name.to_string(), value);
                return Ok(());
            }
        }
        // Not found – create in innermost scope.
        self.define(name, value);
        Ok(())
    }

    pub fn get(&self, name: &str) -> Option<Value> {
        self.scopes
            .iter()
            .rev()
            .find_map(|scope| scope.vars.get(name).cloned())
    }

    pub fn get_all(&self) -> HashMap<String, Value> {
        let mut result = HashMap::new();
        // Outer scopes first so inner scopes shadow correctly.
        for scope in &self.scopes {
            for (name, value) in &scope.vars {
                result.insert(name.clone(), value.clone());
            }
        }
        result
    }
}

impl Default for Environment {
    fn default() -> Self {
        Self::new()
    }
}

use std::collections::HashMap;

use crate::error::FluxError;
use crate::value::Value;

#[derive(Debug, Clone)]
pub struct Environment {
    scopes: Vec<HashMap<String, Value>>,
}

impl Environment {
    pub fn new() -> Self {
        Self {
            scopes: vec![HashMap::new()],
        }
    }

    pub fn push_scope(&mut self) {
        self.scopes.push(HashMap::new());
    }

    pub fn pop_scope(&mut self) {
        if self.scopes.len() > 1 {
            self.scopes.pop();
        }
    }

    pub fn define(&mut self, name: impl Into<String>, value: Value) {
        self.scopes
            .last_mut()
            .expect("environment always has a scope")
            .insert(name.into(), value);
    }

    pub fn set(&mut self, name: impl Into<String>, value: Value) {
        self.define(name, value);
    }

    pub fn assign(&mut self, name: &str, value: Value) -> Result<(), FluxError> {
        for scope in self.scopes.iter_mut().rev() {
            if scope.contains_key(name) {
                scope.insert(name.to_string(), value);
                return Ok(());
            }
        }

        self.define(name, value);
        Ok(())
    }

    pub fn get(&self, name: &str) -> Option<Value> {
        self.scopes
            .iter()
            .rev()
            .find_map(|scope| scope.get(name).cloned())
    }
}

impl Default for Environment {
    fn default() -> Self {
        Self::new()
    }
}

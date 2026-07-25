use std::fmt;

#[derive(Debug, Clone)]
pub struct EzraError {
    pub message: String,
    pub line: usize,
    pub column: usize,
}

impl EzraError {
    pub fn new(message: impl Into<String>, line: usize, column: usize) -> Self {
        Self {
            message: message.into(),
            line,
            column,
        }
    }

    pub fn runtime(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            line: 0,
            column: 0,
        }
    }

    pub fn runtime_at(message: impl Into<String>, line: usize, column: usize) -> Self {
        Self {
            message: message.into(),
            line,
            column,
        }
    }

    pub fn with_line(mut self, line: usize) -> Self {
        if self.line == 0 {
            self.line = line;
            self.column = 1;
        }
        self
    }
}

impl fmt::Display for EzraError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.line == 0 {
            write!(f, "error: {}", self.message)
        } else {
            write!(
                f,
                "error at {}:{}: {}",
                self.line, self.column, self.message
            )
        }
    }
}

impl std::error::Error for EzraError {}

// Backward-compatible type alias so existing code referencing FluxError still compiles during migration
pub type FluxError = EzraError;

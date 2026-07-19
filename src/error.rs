use std::fmt;

#[derive(Debug, Clone)]
pub struct FluxError {
    pub message: String,
    pub line: usize,
    pub column: usize,
}

impl FluxError {
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
}

impl fmt::Display for FluxError {
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

impl std::error::Error for FluxError {}

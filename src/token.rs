#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    Number(f64),
    Text(String),
    Identifier(String),

    Yes,
    No,
    Nothing,

    Is,
    Not,
    And,
    Or,

    Plus,
    Minus,
    Star,
    Slash,
    Percent,

    PlusEqual,
    MinusEqual,
    StarEqual,
    SlashEqual,

    Greater,
    GreaterEqual,
    Less,
    LessEqual,
    EqualEqual,
    BangEqual,

    LeftParen,
    RightParen,
    LeftBracket,
    RightBracket,
    LeftBrace,
    RightBrace,
    Comma,
    Colon,
    Dot,

    Newline,
    Eof,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub kind: TokenKind,
    pub line: usize,
    pub column: usize,
}

impl Token {
    pub fn new(kind: TokenKind, line: usize, column: usize) -> Self {
        Self { kind, line, column }
    }
}

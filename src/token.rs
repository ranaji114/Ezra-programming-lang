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
    Power,

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

    BitwiseAnd,
    BitwiseOr,
    BitwiseXor,
    BitwiseNot,
    ShiftLeft,
    ShiftRight,

    LeftParen,
    RightParen,
    LeftBracket,
    RightBracket,
    LeftBrace,
    RightBrace,
    Comma,
    Colon,
    Dot,
    Arrow,
    Question,
    Pipe,

    Newline,
    Eof,

    Check,
    Otherwise,
    Repeat,
    Times,
    For,
    Each,
    In,
    Give,
    Return,
    Break,
    Next,

    Try,
    Catch,
    Finally,
    Throw,
    Error,

    Use,
    As,
    From,
    Export,
    Module,

    Pick,
    When,
    Match,

    Let,
    Const,
    Type,
    Struct,
    Enum,
    Impl,
    Self_,
    New,
    Pub,
    Priv,

    Async,
    Await,
    Fn,
    Loop,
    While,
    Until,
    Do,
    End,
    With,
    Without,
    Assert,
    Test,
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

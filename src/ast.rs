#[derive(Debug, Clone)]
pub struct Program {
    pub statements: Vec<Stmt>,
}

#[derive(Debug, Clone)]
pub enum Stmt {
    Say(Expr),
    Write(Expr),
    Warn(Expr),
    Fail(Expr),
    Debug(Expr),
    Clear,
    Exit(Expr),
    Assign {
        name: String,
        expr: Expr,
    },
    CompoundAssign {
        name: String,
        op: CompoundOp,
        expr: Expr,
    },
    Check {
        condition: Expr,
        then_branch: Vec<Stmt>,
        else_branch: Vec<Stmt>,
    },
    RepeatTimes {
        count: Expr,
        body: Vec<Stmt>,
    },
    ForEach {
        item: String,
        collection: Expr,
        body: Vec<Stmt>,
    },
    Function {
        name: String,
        params: Vec<String>,
        body: Vec<Stmt>,
    },
    Return(Expr),
    Break,
    Next,
    Expr(Expr),
}

#[derive(Debug, Clone)]
pub enum Expr {
    Number(f64),
    Text(String),
    Bool(bool),
    Nothing,
    Variable(String),
    List(Vec<Expr>),
    Object(Vec<(String, Expr)>),
    Input(Box<Expr>),
    InputNumber(Box<Expr>),
    Unary {
        op: UnaryOp,
        right: Box<Expr>,
    },
    Binary {
        left: Box<Expr>,
        op: BinaryOp,
        right: Box<Expr>,
    },
    Call {
        callee: Box<Expr>,
        args: Vec<Expr>,
    },
    Index {
        target: Box<Expr>,
        index: Box<Expr>,
    },
    Property {
        target: Box<Expr>,
        name: String,
    },
    Grouping(Box<Expr>),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UnaryOp {
    Negate,
    Not,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BinaryOp {
    Add,
    Subtract,
    Multiply,
    Divide,
    Remainder,
    Greater,
    GreaterEqual,
    Less,
    LessEqual,
    Equal,
    NotEqual,
    And,
    Or,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompoundOp {
    Add,
    Subtract,
    Multiply,
    Divide,
}

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

    Try {
        body: Vec<Stmt>,
        catches: Vec<CatchClause>,
        finally_body: Option<Vec<Stmt>>,
        line: usize,
    },
    Throw(Expr),

    Use {
        path: String,
        alias: Option<String>,
    },
    UseFrom {
        path: String,
        names: Vec<String>,
    },
    Export {
        name: String,
    },

    Pick {
        expression: Expr,
        cases: Vec<PickCase>,
        else_case: Option<Vec<Stmt>>,
    },

    Let {
        name: String,
        type_hint: Option<String>,
        expr: Expr,
    },
    Const {
        name: String,
        type_hint: Option<String>,
        expr: Expr,
    },
    Struct {
        name: String,
        fields: Vec<String>,
    },
    Enum {
        name: String,
        variants: Vec<String>,
    },
    Impl {
        struct_name: String,
        methods: Vec<Stmt>,
    },

    Assert {
        condition: Expr,
        message: Option<Expr>,
    },

    Loop {
        body: Vec<Stmt>,
    },
    While {
        condition: Expr,
        body: Vec<Stmt>,
    },
    Until {
        condition: Expr,
        body: Vec<Stmt>,
    },
}

#[derive(Debug, Clone)]
pub struct CatchClause {
    pub error_name: Option<String>,
    pub body: Vec<Stmt>,
}

#[derive(Debug, Clone)]
pub struct PickCase {
    pub pattern: Expr,
    pub body: Vec<Stmt>,
}

#[derive(Debug, Clone)]
pub enum Expr {
    Number(f64),
    Text(String),
    Bool(bool),
    Nothing,
    Variable {
        name: String,
        line: usize,
    },
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
    InterpolatedText(Vec<TextPart>),
    ArrowFunction {
        params: Vec<String>,
        body: Box<Expr>,
    },
    Pipe {
        left: Box<Expr>,
        right: Box<Expr>,
    },
    Ternary {
        condition: Box<Expr>,
        then_expr: Box<Expr>,
        else_expr: Box<Expr>,
    },
    TypeHint {
        expr: Box<Expr>,
        type_name: String,
    },
    SizeOf(Box<Expr>),
    TypeOf(Box<Expr>),
    Spread(Box<Expr>),
    OptionalChain {
        target: Box<Expr>,
        property: String,
    },
}

#[derive(Debug, Clone)]
pub enum TextPart {
    Literal(String),
    Interpolation(Expr),
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
    Power,
    Greater,
    GreaterEqual,
    Less,
    LessEqual,
    Equal,
    NotEqual,
    And,
    Or,
    BitwiseAnd,
    BitwiseOr,
    BitwiseXor,
    ShiftLeft,
    ShiftRight,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompoundOp {
    Add,
    Subtract,
    Multiply,
    Divide,
}

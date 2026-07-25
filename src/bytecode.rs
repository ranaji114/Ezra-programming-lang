use crate::value::Value;

#[derive(Debug, Clone)]
pub enum Instr {
    Const(Value),
    Load(String, usize),
    Store(String),
    StoreConst(String),
    Assign(String),
    PushScope,
    PopScope,
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    Pow,
    Neg,
    Gt,
    Ge,
    Lt,
    Le,
    Eq,
    Ne,
    Not,
    And,
    Or,
    BitAnd,
    BitOr,
    BitXor,
    Shl,
    Shr,
    BitNot,
    Index,
    IndexSet,
    Property(String),
    MakeList(usize),
    MakeObject(usize),
    Call(usize),
    MakeFunc(usize),
    Ret,
    RetVal,
    Jump(usize),
    JumpIfFalse(usize),
    JumpIfTrue(usize),
    Say,
    Throw,
    Assert,
    Input,
    InputNumber,
    EnterTry(usize, usize, usize),
    EndTry,
    Rethrow,
    /// EnterLoop(break_ip, continue_ip) — push a LoopFrame onto the loop stack.
    EnterLoop(usize, usize),
    /// ExitLoop — pop a LoopFrame from the loop stack.
    ExitLoop,
    Break,
    Next,
    Halt,
    Dup,
    Pop,
    Swap,
    Interpolate(usize),
    SizeOf,
    TypeOf,
    Expand,
    Ternary,
    Builtin(String, usize),
}

#[derive(Debug, Clone)]
pub struct ExprChunk {
    pub instrs: Vec<Instr>,
}

impl ExprChunk {
    pub fn new() -> Self {
        ExprChunk { instrs: vec![] }
    }
    pub fn emit(&mut self, op: Instr) {
        self.instrs.push(op);
    }
}

impl Default for ExprChunk {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct CompiledFunc {
    pub name: String,
    pub params: Vec<String>,
    pub instrs: Vec<Instr>,
}

#[derive(Debug, Clone)]
pub struct Program {
    pub instrs: Vec<Instr>,
    pub constants: Vec<Value>,
    pub strings: Vec<String>,
    pub functions: Vec<CompiledFunc>,
}

impl Program {
    pub fn new() -> Self {
        Program {
            instrs: vec![],
            constants: vec![],
            strings: vec![],
            functions: vec![],
        }
    }
    pub fn add_const(&mut self, v: Value) -> usize {
        let i = self.constants.len();
        self.constants.push(v);
        i
    }
    pub fn add_str(&mut self, s: String) -> usize {
        let i = self.strings.len();
        self.strings.push(s);
        i
    }
    pub fn emit(&mut self, op: Instr) {
        self.instrs.push(op);
    }
    pub fn add_func(&mut self, f: CompiledFunc) -> usize {
        let i = self.functions.len();
        self.functions.push(f);
        i
    }
}

impl Default for Program {
    fn default() -> Self {
        Self::new()
    }
}

use crate::error::EzraError as FluxError;
use crate::token::{Token, TokenKind};

pub fn lex_expression(
    source: &str,
    line: usize,
    column_offset: usize,
) -> Result<Vec<Token>, FluxError> {
    let mut lexer = Lexer::new(source, line, column_offset);
    lexer.lex()
}

struct Lexer {
    chars: Vec<char>,
    current: usize,
    line: usize,
    column_offset: usize,
    tokens: Vec<Token>,
}

impl Lexer {
    fn new(source: &str, line: usize, column_offset: usize) -> Self {
        Self {
            chars: source.chars().collect(),
            current: 0,
            line,
            column_offset,
            tokens: Vec::new(),
        }
    }

    fn lex(&mut self) -> Result<Vec<Token>, FluxError> {
        while !self.is_at_end() {
            let start = self.current;
            let ch = self.advance();
            match ch {
                ' ' | '\t' | '\r' => {}
                '\n' => self.add(TokenKind::Newline, start),
                '(' => self.add(TokenKind::LeftParen, start),
                ')' => self.add(TokenKind::RightParen, start),
                '[' => self.add(TokenKind::LeftBracket, start),
                ']' => self.add(TokenKind::RightBracket, start),
                '{' => self.add(TokenKind::LeftBrace, start),
                '}' => self.add(TokenKind::RightBrace, start),
                ',' => self.add(TokenKind::Comma, start),
                ':' => self.add(TokenKind::Colon, start),
                '.' => self.add(TokenKind::Dot, start),
                '+' => {
                    let kind = if self.match_char('=') {
                        TokenKind::PlusEqual
                    } else {
                        TokenKind::Plus
                    };
                    self.add(kind, start);
                }
                '-' => {
                    let kind = if self.match_char('>') {
                        TokenKind::Arrow
                    } else if self.match_char('=') {
                        TokenKind::MinusEqual
                    } else {
                        TokenKind::Minus
                    };
                    self.add(kind, start);
                }
                '*' => {
                    let kind = if self.match_char('*') {
                        TokenKind::Power
                    } else if self.match_char('=') {
                        TokenKind::StarEqual
                    } else {
                        TokenKind::Star
                    };
                    self.add(kind, start);
                }
                '%' => self.add(TokenKind::Percent, start),
                '|' => {
                    if self.match_char('>') {
                        self.add(TokenKind::Pipe, start);
                    } else if self.match_char('|') {
                        self.add(TokenKind::Or, start);
                    } else {
                        self.add(TokenKind::BitwiseOr, start);
                    }
                }
                '&' => {
                    if self.match_char('&') {
                        self.add(TokenKind::And, start);
                    } else {
                        self.add(TokenKind::BitwiseAnd, start);
                    }
                }
                '^' => self.add(TokenKind::BitwiseXor, start),
                '~' => self.add(TokenKind::BitwiseNot, start),
                '?' => self.add(TokenKind::Question, start),
                '/' => {
                    if self.match_char('/') {
                        break;
                    } else if self.match_char('=') {
                        self.add(TokenKind::SlashEqual, start);
                    } else {
                        self.add(TokenKind::Slash, start);
                    }
                }
                '>' => {
                    let kind = if self.match_char('>') {
                        TokenKind::ShiftRight
                    } else if self.match_char('=') {
                        TokenKind::GreaterEqual
                    } else {
                        TokenKind::Greater
                    };
                    self.add(kind, start);
                }
                '<' => {
                    let kind = if self.match_char('<') {
                        TokenKind::ShiftLeft
                    } else if self.match_char('=') {
                        TokenKind::LessEqual
                    } else {
                        TokenKind::Less
                    };
                    self.add(kind, start);
                }
                '=' => {
                    if self.match_char('=') {
                        self.add(TokenKind::EqualEqual, start);
                    } else {
                        return Err(self.error(
                            "single `=` is not supported; use `is` for assignment/equality",
                            start,
                        ));
                    }
                }
                '!' => {
                    if self.match_char('=') {
                        self.add(TokenKind::BangEqual, start);
                    } else {
                        return Err(self.error("use `not` instead of `!`", start));
                    }
                }
                '"' => self.text(start)?,
                '#' => break,
                ch if ch.is_ascii_digit() => self.number(start)?,
                ch if is_identifier_start(ch) => self.identifier(start),
                _ => return Err(self.error(format!("unexpected character `{ch}`"), start)),
            }
        }

        self.tokens
            .push(Token::new(TokenKind::Eof, self.line, self.column()));
        Ok(std::mem::take(&mut self.tokens))
    }

    fn text(&mut self, start: usize) -> Result<(), FluxError> {
        let mut value = String::new();

        while !self.is_at_end() {
            let ch = self.advance();
            match ch {
                '"' => {
                    self.add(TokenKind::Text(value), start);
                    return Ok(());
                }
                '\\' => {
                    let escaped = if self.is_at_end() {
                        return Err(self.error("unterminated escape sequence", start));
                    } else {
                        self.advance()
                    };
                    match escaped {
                        'n' => value.push('\n'),
                        't' => value.push('\t'),
                        '"' => value.push('"'),
                        '\\' => value.push('\\'),
                        other => value.push(other),
                    }
                }
                other => value.push(other),
            }
        }

        Err(self.error("unterminated text literal", start))
    }

    fn number(&mut self, start: usize) -> Result<(), FluxError> {
        while self.peek().is_some_and(|ch| ch.is_ascii_digit()) {
            self.advance();
        }

        if self.peek() == Some('.') && self.peek_next().is_some_and(|ch| ch.is_ascii_digit()) {
            self.advance();
            while self.peek().is_some_and(|ch| ch.is_ascii_digit()) {
                self.advance();
            }
        }

        let raw: String = self.chars[start..self.current].iter().collect();
        let value = raw
            .parse::<f64>()
            .map_err(|_| self.error(format!("invalid number `{raw}`"), start))?;
        self.add(TokenKind::Number(value), start);
        Ok(())
    }

    fn identifier(&mut self, start: usize) {
        while self.peek().is_some_and(is_identifier_part) {
            self.advance();
        }

        let raw: String = self.chars[start..self.current].iter().collect();
        let kind = match raw.as_str() {
            "yes" => TokenKind::Yes,
            "no" => TokenKind::No,
            "nothing" => TokenKind::Nothing,
            "is" => TokenKind::Is,
            "not" => TokenKind::Not,
            "and" => TokenKind::And,
            "or" => TokenKind::Or,
            "check" => TokenKind::Check,
            "otherwise" => TokenKind::Otherwise,
            "repeat" => TokenKind::Repeat,
            "times" => TokenKind::Times,
            "for" => TokenKind::For,
            "each" => TokenKind::Each,
            "in" => TokenKind::In,
            "give" => TokenKind::Give,
            "return" => TokenKind::Return,
            "break" => TokenKind::Break,
            "next" => TokenKind::Next,
            "try" => TokenKind::Try,
            "catch" => TokenKind::Catch,
            "finally" => TokenKind::Finally,
            "throw" => TokenKind::Throw,
            "error" => TokenKind::Error,
            "use" => TokenKind::Use,
            "as" => TokenKind::As,
            "from" => TokenKind::From,
            "export" => TokenKind::Export,
            "module" => TokenKind::Module,
            "pick" => TokenKind::Pick,
            "when" => TokenKind::When,
            "match" => TokenKind::Match,
            "let" => TokenKind::Let,
            "const" => TokenKind::Const,
            "type" => TokenKind::Type,
            "struct" => TokenKind::Struct,
            "enum" => TokenKind::Enum,
            "impl" => TokenKind::Impl,
            "self" => TokenKind::Self_,
            "new" => TokenKind::New,
            "pub" => TokenKind::Pub,
            "priv" => TokenKind::Priv,
            "async" => TokenKind::Async,
            "await" => TokenKind::Await,
            "fn" => TokenKind::Fn,
            "loop" => TokenKind::Loop,
            "while" => TokenKind::While,
            "until" => TokenKind::Until,
            "do" => TokenKind::Do,
            "end" => TokenKind::End,
            "with" => TokenKind::With,
            "without" => TokenKind::Without,
            "assert" => TokenKind::Assert,
            "test" => TokenKind::Test,
            _ => TokenKind::Identifier(raw),
        };
        self.add(kind, start);
    }

    fn add(&mut self, kind: TokenKind, start: usize) {
        self.tokens
            .push(Token::new(kind, self.line, self.column_offset + start + 1));
    }

    fn error(&self, message: impl Into<String>, start: usize) -> FluxError {
        FluxError::new(message, self.line, self.column_offset + start + 1)
    }

    fn advance(&mut self) -> char {
        let ch = self.chars[self.current];
        self.current += 1;
        ch
    }

    fn match_char(&mut self, expected: char) -> bool {
        if self.peek() == Some(expected) {
            self.current += 1;
            true
        } else {
            false
        }
    }

    fn peek(&self) -> Option<char> {
        self.chars.get(self.current).copied()
    }

    fn peek_next(&self) -> Option<char> {
        self.chars.get(self.current + 1).copied()
    }

    fn is_at_end(&self) -> bool {
        self.current >= self.chars.len()
    }

    fn column(&self) -> usize {
        self.column_offset + self.current + 1
    }
}

fn is_identifier_start(ch: char) -> bool {
    ch.is_ascii_alphabetic() || ch == '_'
}

fn is_identifier_part(ch: char) -> bool {
    ch.is_ascii_alphanumeric() || ch == '_'
}

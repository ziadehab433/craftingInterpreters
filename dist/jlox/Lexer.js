var _a;
import { TokenType } from './TokenType.js';
import { Token } from './Token.js';
import { Lox } from './Lox.js';
export class Lexer {
    constructor(source) {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.source = source;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    scanToken() {
        let c = this.advance();
        switch (c) {
            case '(':
                this.addToken(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    while (this.peek() !== '\n' && !this.isAtEnd())
                        this.advance();
                }
                else if (this.match('*')) {
                    this.multiLineComment();
                }
                else {
                    this.addToken(TokenType.SLASH);
                }
            case ' ':
            case '\r':
            case '\t':
                // ignore these whitespaces
                break;
            case '\n':
                this.line++;
                break;
            case '"':
                this.string();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    Lox.errorLine(this.line, "Unexpected Character.");
                }
                break;
        }
    }
    advance() {
        return this.source.charAt(this.current++);
    }
    addToken(type, literal) {
        const lexeme = this.source.substring(this.start, this.current);
        if (typeof literal === 'undefined') {
            literal = null;
        }
        this.tokens.push(new Token(type, lexeme, literal, this.line));
    }
    match(c) {
        if (this.isAtEnd())
            return false;
        if (this.source.charAt(this.current) != c)
            return false;
        this.current++;
        return true;
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.source.charAt(this.current);
    }
    string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n')
                this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            Lox.errorLine(this.line, 'Unterminated string.');
            return;
        }
        this.advance();
        let literal = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, literal);
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    number() {
        while (this.isDigit(this.peek()))
            this.advance();
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek()))
                this.advance();
        }
        let literal = this.source.substring(this.start, this.current);
        this.addToken(TokenType.NUMBER, parseFloat(literal));
    }
    peekNext() {
        if (this.current + 1 >= this.source.length)
            return '\0';
        return this.source.charAt(this.current + 1);
    }
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c === '_');
    }
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
    identifier() {
        while (this.isAlphaNumeric(this.peek()))
            this.advance();
        const word = this.source.substring(this.start, this.current);
        let type = _a.keywords.get(word);
        if (type === undefined)
            type = TokenType.IDENTIFIER;
        this.addToken(type);
    }
    multiLineComment() {
        let stack = [0];
        while (!this.isAtEnd()) {
            if (this.peek() === '/' && this.peekNext() === '*') {
                this.advance();
                stack.push(0);
            }
            if (this.peek() === '*' && this.peekNext() === '/') {
                this.advance();
                if (stack.length === 1) {
                    this.advance();
                    break;
                }
                else if (stack.length === 0) { //  idk deal with it later (i dont know what to make it do when it finds the extra */ or /*)
                    Lox.errorLine(this.line, "Unexpected Character.");
                    break;
                }
                stack.pop();
            }
            this.advance();
        }
    }
}
_a = Lexer;
(() => {
    _a.keywords = new Map();
    _a.keywords.set("and", TokenType.AND);
    _a.keywords.set("class", TokenType.CLASS);
    _a.keywords.set("else", TokenType.ELSE);
    _a.keywords.set("false", TokenType.FALSE);
    _a.keywords.set("for", TokenType.FOR);
    _a.keywords.set("fun", TokenType.FUN);
    _a.keywords.set("if", TokenType.IF);
    _a.keywords.set("nil", TokenType.NIL);
    _a.keywords.set("or", TokenType.OR);
    _a.keywords.set("print", TokenType.PRINT);
    _a.keywords.set("return", TokenType.RETURN);
    _a.keywords.set("super", TokenType.SUPER);
    _a.keywords.set("this", TokenType.THIS);
    _a.keywords.set("true", TokenType.TRUE);
    _a.keywords.set("var", TokenType.VAR);
    _a.keywords.set("while", TokenType.WHILE);
})();

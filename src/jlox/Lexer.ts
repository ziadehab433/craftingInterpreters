import { TokenType } from './TokenType.js';
import { Token } from './Token.js';
import { Lox } from './Lox.js'

export class Lexer { 
    private readonly source: string;
    private readonly tokens: Token[] = [];

    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    private static keywords: Map<string, TokenType>;

    static { 
        this.keywords = new Map();

        this.keywords.set("and",    TokenType.AND);
        this.keywords.set("class",  TokenType.CLASS);
        this.keywords.set("else",   TokenType.ELSE);
        this.keywords.set("false",  TokenType.FALSE);
        this.keywords.set("for",    TokenType.FOR);
        this.keywords.set("fun",    TokenType.FUN);
        this.keywords.set("if",     TokenType.IF);
        this.keywords.set("nil",    TokenType.NIL);
        this.keywords.set("or",     TokenType.OR);
        this.keywords.set("print",  TokenType.PRINT);
        this.keywords.set("return", TokenType.RETURN);
        this.keywords.set("super",  TokenType.SUPER);
        this.keywords.set("this",   TokenType.THIS);
        this.keywords.set("true",   TokenType.TRUE);
        this.keywords.set("var",    TokenType.VAR);
        this.keywords.set("while",  TokenType.WHILE);
    }

    constructor(source: string){ 
        this.source = source;
    }

    scanTokens(): Token[] { 
        while(!this.isAtEnd()){ 
            this.start = this.current;

            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    private isAtEnd(): boolean{ 
        return this.current >= this.source.length;
    }

    private scanToken(){ 
        let c = this.advance();

        switch(c){ 
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
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
                if(this.match('/')){ 
                    while(this.peek() !== '\n' && !this.isAtEnd()) this.advance();
                }else if(this.match('*')){ 
                    this.multiLineComment();
                }else{ 
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
            case '"': this.string(); break;
            default: 
                if(this.isDigit(c)){ 
                    this.number();
                }else if(this.isAlpha(c)){ 
                    this.identifier();
                }else{ 
                    Lox.errorLine(this.line, "Unexpected Character.");
                }
                break;
        }
    }

    private advance(): string{ 
        return this.source.charAt(this.current++);
    }

    private addToken(type: TokenType, literal?: any){ 
        const lexeme = this.source.substring(this.start, this.current);

        if(typeof literal === 'undefined'){ 
            literal = null;
        }

        this.tokens.push(new Token(type, lexeme, literal, this.line));
    }

    private match(c: string): boolean{ 
        if(this.isAtEnd()) return false;
        if(this.source.charAt(this.current) != c) return false;

        this.current++;
        return true;
    }

    private peek(): string{ 
        if(this.isAtEnd()) return '\0';

        return this.source.charAt(this.current);
    }

    private string(): void{ 
        while(this.peek() !== '"' && !this.isAtEnd()){ 
            if(this.peek() === '\n') this.line++;

            this.advance();
        }

        if(this.isAtEnd()){ 
            Lox.errorLine(this.line, 'Unterminated string.');
            return;
        }

        this.advance();

        let literal = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, literal);
    }

    private isDigit(c: string): boolean{ 
        return c >= '0' && c <= '9';
    }

    private number(): void{ 
        while(this.isDigit(this.peek())) this.advance(); 

        if(this.peek() === '.' && this.isDigit(this.peekNext())){ 
            this.advance();

            while(this.isDigit(this.peek())) this.advance(); 
        }

        let literal = this.source.substring(this.start, this.current);
        this.addToken(TokenType.NUMBER, parseFloat(literal));
    }

    private peekNext(): string{ 
        if(this.current + 1 >= this.source.length) return '\0';

        return this.source.charAt(this.current + 1);
    }

    private isAlpha(c: string): boolean{ 
        return (c >= 'a' && c <= 'z') ||
               (c >= 'A' && c <= 'Z') || 
               (c === '_');
    }

    private isAlphaNumeric(c: string): boolean{ 
        return this.isAlpha(c) || this.isDigit(c);
    }

    private identifier(): void{ 
        while(this.isAlphaNumeric(this.peek())) this.advance();

        const word = this.source.substring(this.start, this.current);
        let type = Lexer.keywords.get(word);
        if(type === undefined) type = TokenType.IDENTIFIER;

        this.addToken(type as TokenType);
    }

    private multiLineComment(): void{ 
        let stack = [0];

        while(!this.isAtEnd()){
            if(this.peek() === '/' && this.peekNext() === '*'){ 
                this.advance();

                stack.push(0);
            }

            if(this.peek() === '*' && this.peekNext() === '/'){ 
                this.advance();

                if(stack.length === 1){ 
                    this.advance();
                    break;
                }else if(stack.length === 0){  //  idk deal with it later (i dont know what to make it do when it finds the extra */ or /*)
                    Lox.errorLine(this.line, "Unexpected Character.");
                    break;
                }

                stack.pop();
            }

            this.advance();
        }
    }
}

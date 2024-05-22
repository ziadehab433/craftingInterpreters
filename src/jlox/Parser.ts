import { Expr } from './Expr.js';
import { Lox } from './Lox.js';
import { Stmt } from './Stmt.js';
import { Token } from './Token.js';
import { TokenType } from './TokenType.js';

export class Parser { 
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]){ 
        this.tokens = tokens;
    }

    parse(): Stmt[]{ 
        let statements: Stmt[] = []
        while(!this.isAtEnd()){ 
            statements.push(this.statement());
        }

        return statements
    }

    statement(): Stmt { 
        if(this.match(TokenType.PRINT)) return this.printStatement();

        return this.expressionStatement();
    }

    printStatement(): Stmt{ 
        let value: Expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    }

    expressionStatement(): Stmt{ 
        let value: Expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(value);
    }

    expression(): Expr{ 
        return this.equality();
    }

    equality(): Expr{ 
        let expr: Expr = this.comparison();

        while(this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)){ 
            let operator: Token = this.previous();
            let right: Expr = this.comparison();

            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    comparison(): Expr{
        let expr: Expr = this.term();

        while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)){ 
            let operator: Token = this.previous();
            let right: Expr = this.term();

            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    term(): Expr{ 
        let expr: Expr = this.factor();

        while(this.match(TokenType.MINUS, TokenType.PLUS)){ 
            let operator: Token = this.previous();
            let right: Expr = this.factor();

            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    factor(): Expr{ 
        let expr: Expr = this.unary();

        while(this.match(TokenType.SLASH, TokenType.STAR)){ 
            let operator: Token = this.previous();
            let right: Expr = this.unary();

            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    unary(): Expr{ 
        if(this.match(TokenType.BANG, TokenType.MINUS)){ 
            let operator: Token = this.previous();
            let right = this.unary();

            return new Expr.Unary(operator, right);
        }

        return this.primary();
    }

    primary(): Expr{ 
        if(this.match(TokenType.FALSE)) return new Expr.Literal(false);
        if(this.match(TokenType.TRUE)) return new Expr.Literal(true);
        if(this.match(TokenType.NIL)) return new Expr.Literal(null);

        if(this.match(TokenType.NUMBER, TokenType.STRING)){ 
            return new Expr.Literal(this.previous().literal);
        }

        if(this.match(TokenType.LEFT_PAREN)){ 
            let expr: Expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Expr.Grouping(expr);
        }

        throw this.error(this.peek(), "Expected expression.");
    }

    advance(): Token{ 
        if(!this.isAtEnd()) this.current++;
        return this.previous();
    }
    
    isAtEnd(): boolean{ 
        return this.peek().type == TokenType.EOF;
    }

    previous(): Token{ 
        return this.tokens[this.current - 1];
    }

    peek(): Token{ 
        return this.tokens[this.current];
    }

    match(...types: TokenType[]): boolean{ 
        for(let i = 0; i < types.length; i++){
            if(this.check(types[i])){ 
                this.advance();
                return true;
            }
        }

        return false;
    }

    consume(type: TokenType, err: string): Token{ 
        if(this.check(type)) return this.advance();

        throw this.error(this.peek(), err);
    }

    check(type: TokenType): boolean{ 
        if(this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    error(token: Token, err: string): Error{ 
        Lox.errorToken(token, err);

        return new Error(err);
    }

    synchronize(): void{ 
        this.advance();

        while(!this.isAtEnd()){ 
            if(this.previous().type == TokenType.SEMICOLON) return;

            switch(this.peek().type){ 
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }
}

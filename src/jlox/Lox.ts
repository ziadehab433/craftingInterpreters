import fs from 'node:fs';
import readline from 'node:readline';
import { Lexer } from './Lexer.js';
import { Token } from './Token.js';
import { TokenType } from './TokenType.js';
import { Parser } from './Parser.js';
import { Expr } from './Expr.js';
import { AstPrinter } from './AstPrinter.js';
import { RuntimeError } from './RuntimeError.js';
import { Interpreter } from './Interpreter.js';
import { Stmt } from './Stmt.js';

export class Lox{ 
    private static readonly interpreter: Interpreter = new Interpreter();
    static hadError = false; 
    static hadRuntimeError = false;

    static main(): void{ 
        let argLen = process.argv.length;

        if(argLen === 3){ 
            if(Lox.hadError){ 
                return;
            }

            const path = process.argv[2];
            const string = fs.readFileSync(path, 'utf8');

            Lox.run(string);

            if(this.hadError) return;
            if(this.hadRuntimeError) return;

        }else if(argLen === 2){ 

            const rl = readline.createInterface({ 
                input: process.stdin,
                output: process.stdout
            });

            rl.on('line', (line: string) => { 
                Lox.run(line);
                Lox.hadError = false;
            }) 

        }else{ 
            console.error(new Error("thats illegal"));    
        }
    }

    static run(string: string): void{ 
        let lexer = new Lexer(string);
        let tokens: Token[] = lexer.scanTokens();

        let parser: Parser = new Parser(tokens);
        let statements: Stmt[] = parser.parse();

        if(Lox.hadError) return;

        this.interpreter.interpret(statements);
    }

    static errorLine(line: number, err: string): void{ 
        this.report(line, "", err);
    }

    static report(line: number, where: string, err: string): void{ 
        console.log("[line " + line + "] Error " + where + ": " + err);

        Lox.hadError = true;
    }

    static errorToken(token: Token, err: string): void{ 
        if(token.type == TokenType.EOF){ 
            Lox.report(token.line, "at end", err);
        }else{ 
            Lox.report(token.line, "at '" + token.lexeme + "'", err);
        }
    }

    static runtimeError(err: any): void{ 
        console.log(`${err.message} \n[line ${err.token.line} ]`);

        this.hadRuntimeError = true;
    }
}

Lox.main()


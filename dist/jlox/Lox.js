import fs from 'node:fs';
import readline from 'node:readline';
import { Lexer } from './Lexer.js';
import { TokenType } from './TokenType.js';
import { Parser } from './Parser.js';
import { Interpreter } from './Interpreter.js';
export class Lox {
    static main() {
        let argLen = process.argv.length;
        if (argLen === 3) {
            if (Lox.hadError) {
                return;
            }
            const path = process.argv[2];
            const string = fs.readFileSync(path, 'utf8');
            Lox.run(string);
            if (this.hadError)
                return;
            if (this.hadRuntimeError)
                return;
        }
        else if (argLen === 2) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.on('line', (line) => {
                Lox.run(line);
                Lox.hadError = false;
            });
        }
        else {
            console.error(new Error("thats illegal"));
        }
    }
    static run(string) {
        let lexer = new Lexer(string);
        let tokens = lexer.scanTokens();
        let parser = new Parser(tokens);
        let statements = parser.parse();
        if (Lox.hadError)
            return;
        this.interpreter.interpret(statements);
    }
    static errorLine(line, err) {
        this.report(line, "", err);
    }
    static report(line, where, err) {
        console.log("[line " + line + "] Error " + where + ": " + err);
        Lox.hadError = true;
    }
    static errorToken(token, err) {
        if (token.type == TokenType.EOF) {
            Lox.report(token.line, "at end", err);
        }
        else {
            Lox.report(token.line, "at '" + token.lexeme + "'", err);
        }
    }
    static runtimeError(err) {
        console.log(`${err.message} \n[line ${err.token.line} ]`);
        this.hadRuntimeError = true;
    }
}
Lox.interpreter = new Interpreter();
Lox.hadError = false;
Lox.hadRuntimeError = false;
Lox.main();

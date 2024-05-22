import { Expr, ExprVisitor } from "./Expr.js";
import { Lox } from "./Lox.js";
import { Token } from "./Token.js";
import { TokenType } from "./TokenType.js";
import { RuntimeError } from "./RuntimeError.js";
import { Stmt, StmtVisitor } from "./Stmt.js";

export class Interpreter implements ExprVisitor<any>,
                                    StmtVisitor<void>{
    interpret(statements: Stmt[]){ 
        try{ 
            for(let i = 0; i < statements.length; i++){ 
                this.execute(statements[i]);
            }
        }catch(e){ 
            Lox.runtimeError(e);
        }
    }

    execute(stmt: Stmt): void{ 
        return stmt.accept(this);
    }

    evaluate(expr: any): any{ 
        return expr.accept(this);
    }

    visitExpressionStmt(stmt: any): void{ 
        this.evaluate(stmt.expression)
    }

    visitPrintStmt(stmt: any): void{ 
        let value = this.evaluate(stmt.expression);
        console.log(this.stringify(value));
    }

    visitBinaryExpr(expr: any): any{ 
        let left: any = this.evaluate(expr.left);
        let right: any = this.evaluate(expr.right);

        switch(expr.operator.type){ 
            case TokenType.MINUS: 
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) - (right as number);
            case TokenType.STAR: 
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) * (right as number);
            case TokenType.SLASH: 
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) / (right as number);
            case TokenType.PLUS:
                if(typeof left === "number" && typeof right === "number"){ 
                    return (left as number) + (right as number);
                }

                if(typeof left === "string" && typeof right === "string"){ 
                    return (left as string) + (right as string);
                }

                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");

                break;
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) > (right as number);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) >= (right as number);
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) < (right as number);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) <= (right as number);
            case TokenType.BANG_EQUAL: 
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL: 
                return this.isEqual(left, right);
        }

        return null;
    }
    
    visitGroupingExpr(expr: any): any{ 
        return this.evaluate(expr.expression);
    }

    visitLiteralExpr(expr: any): any{ 
        return expr.value;
    }

    visitUnaryExpr(expr: any): any{ 
        let right: any = this.evaluate(expr.right);

        switch(expr.operator.type){ 
            case TokenType.MINUS: 
                this.checkNumberOperand(expr.operator, right);
                return -(right as number);
            case TokenType.BANG: 
                return !this.isTruthy(right);
        }
    }

    isTruthy(value: any): boolean{ 
        if(value == null) return false;
        if(typeof value === "boolean") return value;

        return true;
    }

    isEqual(a: any, b: any): boolean{ 
        if(a == null && b == null) return true;
        if(a == null) return false;

        return a == b;
    }

    checkNumberOperand(operator: Token, operand: any): void{ 
        if(typeof operand === "number") return;

        throw new RuntimeError(operator, "Operand must be a number");
    }

    checkNumberOperands(operator: Token, loperand: any, roperand: any): void{ 
        if(typeof loperand === "number" && typeof roperand === "number") return;

        throw new RuntimeError(operator, "Operands must be numbers");
    }

    stringify(value: any): string{ 
        if(value == null) return "nil";

        // don't need the toString thing it already is a value
        return value;
    }
}